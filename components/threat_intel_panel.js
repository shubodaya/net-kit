/**
 * Threat Intel Panel - Threat intelligence tracking and analysis
 * Integrated with options_panel.js for guided discovery
 */

import { renderOptionsPanel } from "./options_panel.js";
import { updateToolContextDisplay } from "./tool_context_display.js";
import {
  createPromptPanel,
  createFooterControls,
} from "./ui_components.js";

const INTEL_SAVES_KEY = "ck_intel_saves";

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

function loadIntelSaves() {
  try {
    const raw = localStorage.getItem(INTEL_SAVES_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveIntelSaves(list) {
  try {
    localStorage.setItem(INTEL_SAVES_KEY, JSON.stringify(list || []));
  } catch {
    // ignore
  }
}

async function saveIntelDraft(body, selectionLabel, optionId, categoryId) {
  const content = (body || "").trim();
  if (!content) return;
  const defaultName = selectionLabel || "Intel draft";
  const name = await askDraftName(defaultName);
  if (!name) return;
  const payload = {
    id: `intel-${Date.now()}`,
    name: name.trim().slice(0, 80),
    body: content,
    savedAt: new Date().toLocaleString(),
    optionId: optionId || "general",
    categoryId: categoryId || "general",
  };
  const list = loadIntelSaves();
  list.unshift(payload);
  saveIntelSaves(list.slice(0, 50));
}

function renderIntelSavedList(targetEl, onLoad, optionId, categoryId) {
  if (!targetEl) return;
  const list = loadIntelSaves().filter((i) => {
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
      const updated = loadIntelSaves().filter((i) => i.id !== item.id);
      saveIntelSaves(updated);
      renderIntelSavedList(targetEl, onLoad, optionId);
    });
    targetEl.appendChild(row);
  });
}

function applyIntelDraft(item, formBody, input) {
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

function composeIntelFormText(formBody) {
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

function buildIntelTemplateFallback(templateText, target) {
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

function buildIntelForm(optionId, target) {
  if (!target) return false;
  target.innerHTML = "";
  const map = {
    "zero-day-tracker": [
      { label: "CVE / ID", type: "text", placeholder: "CVE-2026-1234" },
      { label: "Vendor / Product / Version", type: "text", placeholder: "Vendor Product vX.Y" },
      { label: "Attack vector & prerequisites", type: "textarea", rows: 3 },
      { label: "Exploit availability", type: "select", options: ["In-wild", "Public PoC", "None", "Unknown"] },
      { label: "Detection ideas (log sources/signals)", type: "textarea", rows: 3 },
      { label: "Mitigation / workaround", type: "textarea", rows: 3 },
      { label: "Patch status & ETA", type: "text", placeholder: "Available / Pending / Date" },
      { label: "Business exposure (assets affected)", type: "textarea", rows: 3 },
      { label: "Owner & next review", type: "text", placeholder: "Name, date" },
    ],
    "threat-campaign": [
      { label: "Campaign name", type: "text" },
      { label: "Actor / attribution (confidence)", type: "text" },
      { label: "Timeline (start/end/ongoing)", type: "text" },
      { label: "Target sectors / regions", type: "textarea", rows: 2 },
      { label: "Primary TTPs", type: "textarea", rows: 3 },
      { label: "Infrastructure (IPs/domains/certs)", type: "textarea", rows: 3 },
      { label: "Malware / tooling", type: "textarea", rows: 3 },
      { label: "Detection coverage (rules/sensors)", type: "textarea", rows: 2 },
      { label: "Impact assessment for org", type: "textarea", rows: 2 },
      { label: "Action plan / tasks", type: "textarea", rows: 3 },
    ],
    "ip-reputation": [
      { label: "IP address", type: "text" },
      { label: "ASN / Geo", type: "text" },
      { label: "First seen", type: "text" },
      { label: "Last seen", type: "text" },
      { label: "Observed roles", type: "select", options: ["C2", "Phish", "Spam", "Scanner", "Unknown"] },
      { label: "Threat score / source", type: "text" },
      { label: "Internal sightings", type: "textarea", rows: 3 },
      { label: "Blocks in place", type: "textarea", rows: 2 },
      { label: "Decision", type: "select", options: ["Allow", "Monitor", "Block"] },
      { label: "Notes", type: "textarea", rows: 2 },
    ],
    "domain-reputation": [
      { label: "Domain", type: "text" },
      { label: "Registrar / Created on", type: "text" },
      { label: "Hosting / Resolved IPs", type: "textarea", rows: 2 },
      { label: "TLS info (CN/validity)", type: "text" },
      { label: "Passive DNS notes", type: "textarea", rows: 2 },
      { label: "Abuse history", type: "textarea", rows: 2 },
      { label: "Brand similarity check", type: "text" },
      { label: "Internal sightings", type: "textarea", rows: 2 },
      { label: "Decision", type: "select", options: ["Allow", "Monitor", "Block"] },
      { label: "Notes", type: "textarea", rows: 2 },
    ],
    "hash-reputation": [
      { label: "Hash", type: "text", placeholder: "SHA256/MD5" },
      { label: "File name / type / size", type: "text" },
      { label: "Source (email/url/host)", type: "text" },
      { label: "First seen", type: "text" },
      { label: "VT / intel score", type: "text" },
      { label: "Sandbox verdict / behaviors", type: "textarea", rows: 3 },
      { label: "Prevalence internally", type: "textarea", rows: 2 },
      { label: "Decision", type: "select", options: ["Block", "Quarantine", "Allow"] },
    ],
    "mitre-mapping": [
      { label: "Use case / alert", type: "text" },
      { label: "Tactic", type: "select", options: ["Initial Access", "Execution", "Persistence", "Privilege Escalation", "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement", "Collection", "Exfiltration", "Command & Control", "Impact"] },
      { label: "Technique / Sub-technique", type: "text" },
      { label: "Detection logic (rule/sensor)", type: "textarea", rows: 3 },
      { label: "Data required (log source/fields)", type: "textarea", rows: 2 },
      { label: "Current coverage", type: "select", options: ["Yes", "Partial", "No"] },
      { label: "Gaps and improvements", type: "textarea", rows: 3 },
      { label: "References", type: "text" },
    ],
    "ttp-analysis": [
      { label: "Scenario / Case", type: "text" },
      { label: "Initial access", type: "text" },
      { label: "Execution", type: "text" },
      { label: "Persistence", type: "text" },
      { label: "Privilege escalation", type: "text" },
      { label: "Defense evasion", type: "text" },
      { label: "Credential access", type: "text" },
      { label: "Lateral movement", type: "text" },
      { label: "Exfiltration", type: "text" },
      { label: "Command & control", type: "text" },
      { label: "Detection & mitigations", type: "textarea", rows: 3 },
    ],
  };
  const fields = map[optionId];
  if (!fields) return false;
  fields.forEach((f, idx) => {
    const row = document.createElement("label");
    row.className = "triage-field";
    row.dataset.fieldId = `intel-${optionId}-${idx}`;
    const label = document.createElement("span");
    label.textContent = f.label;
    row.appendChild(label);
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

// State machine for Threat Intel
const threatIntelState = {
  screen: "intro", // intro | options | result
  selectedCategory: null,
  selectedOption: null,
};

/**
 * Initialize Threat Intel
 */
export function initThreatIntel() {
  threatIntelState.screen = "intro";
  threatIntelState.selectedCategory = null;
  threatIntelState.selectedOption = null;
}

/**
 * Render Threat Intel intro
 */
export function renderThreatIntelIntro(container) {
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";

  // Intro
  const intro = createPromptPanel(
    "🔍 Threat Intel Summary",
    "Cipher here. Welcome to Threat Intel.",
    "I can help you analyze threats and track indicators. Pick an analysis category below."
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

  renderOptionsPanel(optionsDiv, "threat_intel", (selection) => {
    threatIntelState.selectedOption = selection;
    threatIntelState.screen = "result";
    renderThreatIntelResult(container);
    speakThreatIntelMessage(
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
    onStopSpeech: stopThreatIntelSpeech,
  });

  container.appendChild(footer);
}

/**
 * Render result after selection
 */
export function renderThreatIntelResult(container) {
  if (!container || !threatIntelState.selectedOption) return;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";

  const selection = threatIntelState.selectedOption;

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

  // Structured form for this intel topic
  const formWrap = document.createElement("div");
  formWrap.className = "triage-form";
  formWrap.innerHTML = `
    <div class="triage-form-head">
      <h4>Fill the fields</h4>
    </div>
    <div class="triage-form-body" id="intelFormBody"></div>
  `;
  container.appendChild(formWrap);

  const formBody = formWrap.querySelector("#intelFormBody");
  if (!buildIntelForm(selection.id, formBody)) {
    buildIntelTemplateFallback(selection.template || "", formBody);
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
    <button class="primary" style="width:100%;padding:12px 14px;font-weight:700;font-size:13px;" id="intelSaveBtn" type="button">Save current note</button>
    <div id="intelSavedList" class="triage-saved-list"></div>
  `;
  container.appendChild(saveCard);

  const savedListEl = saveCard.querySelector("#intelSavedList");
  const input = document.querySelector("#cipherAiInput");
  saveCard.querySelector("#intelSaveBtn")?.addEventListener("click", async () => {
    const body = composeIntelFormText(formBody) || input?.value || selection.template || "";
    await saveIntelDraft(body, selection.label, selection.optionId, selection.categoryId);
    renderIntelSavedList(
      savedListEl,
      (item) => applyIntelDraft(item, formBody, input),
      selection.optionId,
      selection.categoryId
    );
  });
  renderIntelSavedList(
    savedListEl,
    (item) => applyIntelDraft(item, formBody, input),
    selection.optionId,
    selection.categoryId
  );

  // Footer with back button
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      threatIntelState.screen = "intro";
      renderThreatIntelIntro(container);
    },
    onStopSpeech: stopThreatIntelSpeech,
  });

  container.appendChild(footer);
}

/**
 * Main render dispatcher
 */
export function renderThreatIntel(container) {
  if (!container) return;

  container.style.display = "flex";
  container.style.flexDirection = "column";

  // Display tool context at the top
  updateToolContextDisplay("intel", container);

  if (threatIntelState.screen === "intro") {
    renderThreatIntelIntro(container);
  } else if (threatIntelState.screen === "result") {
    renderThreatIntelResult(container);
  }
}

/**
 * Speech handling
 */
let threatIntelSpeechUtterance = null;

export function speakThreatIntelMessage(text) {
  const ENABLE_INTEL_TTS = false;
  if (!ENABLE_INTEL_TTS) return;
  if (!text || window.isSpeechMuted || !("speechSynthesis" in window)) return;

  // Check global mute flag
  if (window.isSpeechMuted) return;

  if (threatIntelSpeechUtterance) {
    window.speechSynthesis.cancel();
  }

  threatIntelSpeechUtterance = new SpeechSynthesisUtterance(text);
  threatIntelSpeechUtterance.rate = 1;
  window.speechSynthesis.speak(threatIntelSpeechUtterance);
}

export function stopThreatIntelSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  threatIntelSpeechUtterance = null;
}

/**
 * Get state for debugging
 */
export function getThreatIntelState() {
  return { ...threatIntelState };
}

/**
 * Reset state
 */
export function resetThreatIntel() {
  initThreatIntel();
}

/**
 * Clear Threat Intel state and re-render to landing state
 */
export function clearThreatIntel() {
  initThreatIntel();
  const container = document.getElementById("cipherDeepBody");
  if (container) {
    renderThreatIntel(container);
  }
}
