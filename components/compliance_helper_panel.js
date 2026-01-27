/**
 * Compliance Helper Panel - Compliance framework tracking and assessment
 * Integrated with options_panel.js for guided discovery
 */

import { renderOptionsPanel } from "./options_panel.js";
import { updateToolContextDisplay } from "./tool_context_display.js";
import {
  createPromptPanel,
  createFooterControls,
} from "./ui_components.js";

const COMPLIANCE_SAVES_KEY = "ck_compliance_saves";

function askDraftName(defaultName) {
  const openPromptFn = window?.openPrompt;
  if (typeof openPromptFn === "function") {
    return openPromptFn({
      title: "Save draft",
      message: "Enter a name for this draft.",
      placeholder: defaultName,
      confirmText: "Save",
      cancelText: "Cancel",
      requireInput: true,
    }).then((res) => (res?.confirmed ? res.value?.trim() || defaultName : null));
  }
  const name = prompt("Name this draft", defaultName);
  return Promise.resolve(name?.trim() || null);
}

function loadComplianceSaves() {
  try {
    const raw = localStorage.getItem(COMPLIANCE_SAVES_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveComplianceSaves(list) {
  try {
    localStorage.setItem(COMPLIANCE_SAVES_KEY, JSON.stringify(list || []));
  } catch {
    // ignore
  }
}

async function saveComplianceDraft(body, selectionLabel, optionId, categoryId) {
  const content = (body || "").trim();
  if (!content) return;
  const defaultName = selectionLabel || "Compliance draft";
  const name = await askDraftName(defaultName);
  if (!name) return;
  const payload = {
    id: `comp-${Date.now()}`,
    name: name.trim().slice(0, 80),
    body: content,
    savedAt: new Date().toLocaleString(),
    optionId: optionId || "general",
    categoryId: categoryId || "general",
  };
  const list = loadComplianceSaves();
  list.unshift(payload);
  saveComplianceSaves(list.slice(0, 50));
}

function renderComplianceSavedList(targetEl, onLoad, optionId, categoryId) {
  if (!targetEl) return;
  const list = loadComplianceSaves().filter((i) => {
    const optMatch = optionId ? i.optionId === optionId : true;
    const catMatch = categoryId ? i.categoryId === categoryId : true;
    return optMatch && catMatch;
  });
  targetEl.innerHTML = "";
  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No saved drafts yet.";
    targetEl.appendChild(empty);
    return;
  }
  list.forEach((item) => {
    const row = document.createElement("div");
    row.className = "triage-saved-row";
    row.innerHTML = `
      <div>
        <div class="label">${item.name}</div>
        <div class="meta">${item.savedAt || ""}</div>
      </div>
      <div class="triage-saved-actions">
        <button class="chip" data-load="${item.id}">Load</button>
        <button class="chip ghost" data-del="${item.id}">Delete</button>
      </div>
    `;
    row.querySelector("[data-load]")?.addEventListener("click", () => onLoad(item));
    row.querySelector("[data-del]")?.addEventListener("click", () => {
      const updated = loadComplianceSaves().filter((i) => i.id !== item.id);
      saveComplianceSaves(updated);
      renderComplianceSavedList(targetEl, onLoad, optionId);
    });
    targetEl.appendChild(row);
  });
}

function applyComplianceDraft(item, formBody, input) {
  if (formBody) {
    const lines = (item.body || "").split("\n");
    lines.forEach((line) => {
      const [rawLabel, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      const label = (rawLabel || "").trim();
      if (!label) return;
      const row = Array.from(formBody.querySelectorAll(".triage-field")).find(
        (r) => r.querySelector("span")?.textContent?.trim() === label
      );
      if (!row) return;
      const inputEl = row.querySelector("input[type='text']");
      const ta = row.querySelector("textarea");
      const sel = row.querySelector("select");
      const cb = row.querySelector("input[type='checkbox']");
      if (inputEl) inputEl.value = value;
      else if (ta) ta.value = value;
      else if (sel) sel.value = value;
      else if (cb) cb.checked = value.toLowerCase().startsWith("y");
    });
  } else if (input) {
    input.value = item.body || item.name || "";
    input.focus();
  }
}

function composeComplianceFormText(formBody) {
  if (!formBody) return "";
  const rows = formBody.querySelectorAll(".triage-field");
  const lines = [];
  rows.forEach((row) => {
    const label = row.querySelector("span")?.textContent?.trim() || "Field";
    const input = row.querySelector("input[type='text']");
    const ta = row.querySelector("textarea");
    const sel = row.querySelector("select");
    const cb = row.querySelector("input[type='checkbox']");
    if (input) lines.push(`${label}: ${input.value || ""}`);
    else if (ta) lines.push(`${label}: ${ta.value || ""}`);
    else if (sel) lines.push(`${label}: ${sel.value || ""}`);
    else if (cb) lines.push(`${label}: ${cb.checked ? "Yes" : "No"}`);
  });
  return lines.join("\n");
}

function buildComplianceTemplateFallback(templateText, target) {
  if (!target) return;
  target.innerHTML = "";
  const lines = (templateText || "").split("\n").map((l) => l.trim()).filter(Boolean);
  lines.forEach((line, idx) => {
    const parts = line.split(":");
    const label = (parts[0] || `Field ${idx + 1}`).trim();
    const placeholder = parts.slice(1).join(":").trim();
    const row = document.createElement("label");
    row.className = "triage-field";
    row.innerHTML = `
      <span>${label}</span>
      <input type="text" placeholder="${placeholder}">
    `;
    target.appendChild(row);
  });
}

function buildComplianceForm(optionId, target) {
  if (!target) return false;
  target.innerHTML = "";
  const map = {
    iso27001: [
      { label: "Control area (A.5-A.18)", type: "text" },
      { label: "Control objective", type: "text" },
      { label: "Requirement text", type: "textarea", rows: 3 },
      { label: "In-scope assets/processes", type: "textarea", rows: 2 },
      { label: "Current status", type: "select", options: ["Compliant", "Partial", "Non-compliant"] },
      { label: "Evidence collected", type: "textarea", rows: 3 },
      { label: "Gaps and remediation", type: "textarea", rows: 3 },
      { label: "Owner & target date", type: "text" },
    ],
    "pci-dss": [
      { label: "Requirement (1-12)", type: "text" },
      { label: "Scope (in/out of CDE)", type: "select", options: ["In-scope", "Out-of-scope", "Partial"] },
      { label: "Testing method", type: "text", placeholder: "Scan / Pen test / Interview / Doc review" },
      { label: "Finding", type: "select", options: ["Pass", "Fail", "NA"] },
      { label: "Evidence collected", type: "textarea", rows: 3 },
      { label: "Remediation plan", type: "textarea", rows: 3 },
      { label: "Target date", type: "text" },
      { label: "Owner", type: "text" },
    ],
    "hipaa-compliance": [
      { label: "Standard (Admin/Physical/Technical)", type: "select", options: ["Administrative", "Physical", "Technical"] },
      { label: "Requirement", type: "textarea", rows: 2 },
      { label: "Applies to PHI?", type: "select", options: ["Yes", "No"] },
      { label: "Current control in place", type: "textarea", rows: 3 },
      { label: "Effectiveness assessment", type: "textarea", rows: 2 },
      { label: "Gap/Risk statement", type: "textarea", rows: 2 },
      { label: "Remediation & owner", type: "textarea", rows: 2 },
    ],
    "control-design": [
      { label: "Control objective", type: "text" },
      { label: "Input/trigger", type: "text" },
      { label: "Control activity description", type: "textarea", rows: 3 },
      { label: "Output/evidence produced", type: "textarea", rows: 2 },
      { label: "Frequency", type: "select", options: ["On-demand", "Daily", "Weekly", "Monthly", "Quarterly"] },
      { label: "Owner", type: "text" },
      { label: "Test method (sample size/period)", type: "textarea", rows: 2 },
      { label: "Test result", type: "select", options: ["Pass", "Fail", "Findings"] },
    ],
    "evidence-collection": [
      { label: "Control being tested", type: "text" },
      { label: "Policy / standard", type: "text" },
      { label: "Procedures / runbooks", type: "text" },
      { label: "Configuration screenshots", type: "textarea", rows: 2 },
      { label: "Audit logs / reports", type: "textarea", rows: 2 },
      { label: "Training records", type: "textarea", rows: 2 },
      { label: "Approvals / sign-off", type: "textarea", rows: 2 },
      { label: "Test samples (systems/changes/users)", type: "textarea", rows: 2 },
    ],
    "audit-readiness": [
      { label: "Framework", type: "text" },
      { label: "In-scope systems", type: "textarea", rows: 2 },
      { label: "In-scope personnel (teams)", type: "textarea", rows: 2 },
      { label: "Critical gaps identified", type: "textarea", rows: 3 },
      { label: "Evidence status", type: "select", options: ["25%", "50%", "75%", "100%"] },
      { label: "Risk rating", type: "select", options: ["Green", "Yellow", "Red"] },
      { label: "Top remediation priorities", type: "textarea", rows: 3 },
    ],
    "audit-schedule": [
      { label: "Scope", type: "text" },
      { label: "Dates (start/end)", type: "text" },
      { label: "Auditor(s)", type: "text" },
      { label: "Kick-off meeting", type: "text" },
      { label: "Data request deadline", type: "text" },
      { label: "Facility/virtual tour", type: "text" },
      { label: "Debrief date", type: "text" },
      { label: "Final report due", type: "text" },
      { label: "Internal owner / coordinator", type: "text" },
    ],
  };
  const fields = map[optionId];
  if (!fields) return false;
  fields.forEach((f, idx) => {
    const row = document.createElement("label");
    row.className = "triage-field";
    row.dataset.fieldId = `comp-${optionId}-${idx}`;
    const span = document.createElement("span");
    span.textContent = f.label;
    row.appendChild(span);
    if (f.type === "textarea") {
      const ta = document.createElement("textarea");
      ta.rows = f.rows || 3;
      ta.placeholder = f.placeholder || "";
      row.appendChild(ta);
    } else if (f.type === "select") {
      const sel = document.createElement("select");
      (f.options || []).forEach((opt) => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        sel.appendChild(o);
      });
      row.appendChild(sel);
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = f.placeholder || "";
      row.appendChild(input);
    }
    target.appendChild(row);
  });
  return true;
}
// State machine for Compliance Helper
const complianceHelperState = {
  screen: "intro", // intro | options | result
  selectedCategory: null,
  selectedOption: null,
};

/**
 * Initialize Compliance Helper
 */
export function initComplianceHelper() {
  complianceHelperState.screen = "intro";
  complianceHelperState.selectedCategory = null;
  complianceHelperState.selectedOption = null;
}

/**
 * Render Compliance Helper intro
 */
export function renderComplianceHelperIntro(container) {
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";

  // Intro
  const intro = createPromptPanel(
    "✓ Compliance Helper",
    "Cipher here. Welcome to Compliance Helper.",
    "I can help you track compliance requirements and assessments. Pick a compliance topic below."
  );
  container.appendChild(intro);

  // Options panel for guided selection
  const optionsDiv = document.createElement("div");
  optionsDiv.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;

  renderOptionsPanel(optionsDiv, "compliance_helper", (selection) => {
    complianceHelperState.selectedOption = selection;
    complianceHelperState.screen = "result";
    renderComplianceHelperResult(container);
    speakComplianceHelperMessage(
      `You selected ${selection.label}. Template loaded.`
    );

    // Prefill input
    const input = document.querySelector("#cipherAiInput");
    if (input) {
      input.value = selection.template;
      input.focus();
    }
  });

  container.appendChild(optionsDiv);

  // Footer
  const footer = createFooterControls({
    showBack: false,
    showStopSpeech: true,
    onStopSpeech: stopComplianceHelperSpeech,
  });

  container.appendChild(footer);
}

/**
 * Render result after selection
 */
export function renderComplianceHelperResult(container) {
  if (!container || !complianceHelperState.selectedOption) return;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";

  const selection = complianceHelperState.selectedOption;

  // Show selected option
  const resultDiv = document.createElement("div");
  resultDiv.style.cssText = `
    background: var(--panel, #f5f5f5);
    border: 1px solid var(--edge, #ddd);
    border-radius: 8px;
    padding: 16px;
    color: var(--text, #000);
  `;

  resultDiv.innerHTML = `
    <h3 style="margin-top: 0; color: var(--accent, #007bff);">${selection.label}</h3>
  `;

  container.appendChild(resultDiv);

  // Structured form for compliance topic
  const formWrap = document.createElement("div");
  formWrap.className = "triage-form";
  formWrap.innerHTML = `
    <div class="triage-form-head">
      <h4>Fill the fields</h4>
    </div>
    <div class="triage-form-body" id="compFormBody"></div>
  `;
  container.appendChild(formWrap);

  const formBody = formWrap.querySelector("#compFormBody");
  if (!buildComplianceForm(selection.id, formBody)) {
    buildComplianceTemplateFallback(selection.template || "", formBody);
  }

  // Save/load drafts area
  const saveCard = document.createElement("div");
  saveCard.className = "triage-saved";
  saveCard.style.cssText = `
    border: 1px solid var(--edge);
    border-radius: 10px;
    padding: 12px;
    background: rgba(2,20,11,0.75);
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;
  saveCard.innerHTML = `
    <h4 style="margin:0;color:var(--ink);">Saved drafts</h4>
    <button class="primary" style="width:100%;padding:12px 14px;font-weight:700;font-size:13px;" id="compSaveBtn" type="button">Save current note</button>
    <div id="compSavedList" class="triage-saved-list"></div>
  `;
  container.appendChild(saveCard);

  const savedListEl = saveCard.querySelector("#compSavedList");
  const input = document.querySelector("#cipherAiInput");
  saveCard.querySelector("#compSaveBtn")?.addEventListener("click", async () => {
    const body = composeComplianceFormText(formBody) || input?.value || selection.template || "";
    await saveComplianceDraft(body, selection.label, selection.optionId, selection.categoryId);
    await renderComplianceSavedList(
      savedListEl,
      (item) => {
        if (input) {
          applyComplianceDraft(item, formBody, input);
        }
      },
      selection.optionId,
      selection.categoryId
    );
  });
  renderComplianceSavedList(
    savedListEl,
    (item) => {
      if (input) {
        applyComplianceDraft(item, formBody, input);
      }
    },
    selection.optionId,
    selection.categoryId
  );

  // Footer with back button
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      complianceHelperState.screen = "intro";
      renderComplianceHelperIntro(container);
    },
    onStopSpeech: stopComplianceHelperSpeech,
  });

  container.appendChild(footer);
}

/**
 * Main render dispatcher
 */
export function renderComplianceHelper(container) {
  if (!container) return;

  container.style.display = "flex";
  container.style.flexDirection = "column";

  // Display tool context at the top
  updateToolContextDisplay("compliance", container);

  if (complianceHelperState.screen === "intro") {
    renderComplianceHelperIntro(container);
  } else if (complianceHelperState.screen === "result") {
    renderComplianceHelperResult(container);
  }
}

/**
 * Speech handling
 */
let complianceHelperSpeechUtterance = null;

export function speakComplianceHelperMessage(text) {
  const ENABLE_COMPLIANCE_TTS = false;
  if (!ENABLE_COMPLIANCE_TTS) return;
  if (!text || window.isSpeechMuted || !("speechSynthesis" in window)) return;

  // Check global mute flag
  if (window.isSpeechMuted) return;

  if (complianceHelperSpeechUtterance) {
    window.speechSynthesis.cancel();
  }

  complianceHelperSpeechUtterance = new SpeechSynthesisUtterance(text);
  complianceHelperSpeechUtterance.rate = 1;
  window.speechSynthesis.speak(complianceHelperSpeechUtterance);
}

export function stopComplianceHelperSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  complianceHelperSpeechUtterance = null;
}

/**
 * Get state for debugging
 */
export function getComplianceHelperState() {
  return { ...complianceHelperState };
}

/**
 * Reset state
 */
export function resetComplianceHelper() {
  initComplianceHelper();
}

/**
 * Clear Compliance Helper state and re-render to landing state
 */
export function clearComplianceHelper() {
  initComplianceHelper();
  const container = document.getElementById("cipherDeepBody");
  if (container) {
    renderComplianceHelper(container);
  }
}
