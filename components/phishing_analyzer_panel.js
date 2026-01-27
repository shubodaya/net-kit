/**
 * Phishing Analyzer Panel - Email phishing detection and classification
 * Integrated with options_panel.js for guided discovery
 */

import { renderOptionsPanel } from "./options_panel.js";
import { updateToolContextDisplay } from "./tool_context_display.js";
import {
  createPromptPanel,
  createFooterControls,
} from "./ui_components.js";

const PHISH_SAVES_KEY = "ck_phish_saves";

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

function loadPhishSaves() {
  try {
    const raw = localStorage.getItem(PHISH_SAVES_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePhishSaves(list) {
  try {
    localStorage.setItem(PHISH_SAVES_KEY, JSON.stringify(list || []));
  } catch {
    // ignore
  }
}

async function savePhishDraft(body, selectionLabel, optionId, categoryId) {
  const content = (body || "").trim();
  if (!content) return;
  const defaultName = selectionLabel || "Phishing draft";
  const name = await askDraftName(defaultName);
  if (!name) return;
  const payload = {
    id: `phish-${Date.now()}`,
    name: name.trim().slice(0, 80),
    body: content,
    savedAt: new Date().toLocaleString(),
    optionId: optionId || "general",
    categoryId: categoryId || "general",
  };
  const list = loadPhishSaves();
  list.unshift(payload);
  savePhishSaves(list.slice(0, 50));
}

function renderPhishSavedList(targetEl, onLoad, optionId, categoryId) {
  if (!targetEl) return;
  const list = loadPhishSaves().filter((i) => {
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
      const updated = loadPhishSaves().filter((i) => i.id !== item.id);
      savePhishSaves(updated);
      renderPhishSavedList(targetEl, onLoad, optionId);
    });
    targetEl.appendChild(row);
  });
}
// State machine for Phishing Analyzer
const phishingAnalyzerState = {
  screen: "intro", // intro | options | result
  selectedCategory: null,
  selectedOption: null,
};

/**
 * Initialize Phishing Analyzer
 */
export function initPhishingAnalyzer() {
  phishingAnalyzerState.screen = "intro";
  phishingAnalyzerState.selectedCategory = null;
  phishingAnalyzerState.selectedOption = null;
}

/**
 * Render Phishing Analyzer intro
 */
export function renderPhishingAnalyzerIntro(container) {
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";

  // Intro
  const intro = createPromptPanel(
    "🎣 Phishing Analyzer",
    "Cipher here. Welcome to Phishing Analyzer.",
    "I can help you analyze and classify phishing emails. Pick an analysis option below."
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

  renderOptionsPanel(optionsDiv, "phishing_analyzer", (selection) => {
    phishingAnalyzerState.selectedOption = selection;
    phishingAnalyzerState.screen = "result";
    renderPhishingAnalyzerResult(container);
    speakPhishingAnalyzerMessage(
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
    onStopSpeech: stopPhishingAnalyzerSpeech,
  });

  container.appendChild(footer);
}

/**
 * Render result after selection
 */
export function renderPhishingAnalyzerResult(container) {
  if (!container || !phishingAnalyzerState.selectedOption) return;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";

  const selection = phishingAnalyzerState.selectedOption;

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

  // Structured form for the selected phishing topic
  const formWrap = document.createElement("div");
  formWrap.className = "triage-form";
  formWrap.innerHTML = `
    <div class="triage-form-head">
      <h4>Fill the fields</h4>
    </div>
    <div class="triage-form-body" id="phishFormBody"></div>
  `;
  container.appendChild(formWrap);

  const formBody = formWrap.querySelector("#phishFormBody");
  if (!buildPhishForm(selection.id, formBody)) {
    buildPhishTemplateFallback(selection.template || "", formBody);
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
    <button class="primary" style="width:100%;padding:12px 14px;font-weight:700;font-size:13px;" id="phishSaveBtn" type="button">Save current note</button>
    <div id="phishSavedList" class="triage-saved-list"></div>
  `;
  container.appendChild(saveCard);

  const savedListEl = saveCard.querySelector("#phishSavedList");
  const input = document.querySelector("#cipherAiInput");
  saveCard.querySelector("#phishSaveBtn")?.addEventListener("click", async () => {
    const body = composePhishFormText(formBody) || input?.value || selection.template || "";
    await savePhishDraft(body, selection.label, selection.optionId, selection.categoryId);
    await renderPhishSavedList(savedListEl, (item) => {
      if (input) {
        applyPhishDraft(item);
      }
    }, selection.optionId, selection.categoryId);
  });
  renderPhishSavedList(savedListEl, (item) => {
    if (input) {
        applyPhishDraft(item);
    }
  }, selection.optionId, selection.categoryId);

  // Helpers for form handling
  function applyPhishDraft(item) {
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
        const input = row.querySelector("input[type='text']");
        const ta = row.querySelector("textarea");
        const sel = row.querySelector("select");
        const cb = row.querySelector("input[type='checkbox']");
        if (input) input.value = value;
        else if (ta) ta.value = value;
        else if (sel) sel.value = value;
        else if (cb) cb.checked = value.toLowerCase().startsWith("y");
      });
    } else if (input) {
      input.value = item.body || item.name || "";
      input.focus();
    }
  }

  function buildPhishTemplateFallback(templateText, target) {
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

  function composePhishFormText(form) {
    if (!form) return "";
    const rows = form.querySelectorAll(".triage-field");
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

  function buildPhishForm(optionId, target) {
    if (!target) return false;
    target.innerHTML = "";
    const map = {
      "header-inspection": [
        { label: "From address", type: "text" },
        { label: "Return-Path", type: "text" },
        { label: "Reply-To (mismatch?)", type: "text" },
        { label: "Sender IP / Received chain", type: "textarea", rows: 2 },
        { label: "SPF result", type: "select", options: ["pass", "fail", "softfail", "neutral", "none"] },
        { label: "DKIM result", type: "select", options: ["pass", "fail", "none"] },
        { label: "DMARC policy/result", type: "text", placeholder: "reject / quarantine / none" },
        { label: "X-Mailer / User-Agent", type: "text" },
        { label: "Anomalies noted", type: "textarea", rows: 3 },
      ],
      "link-analysis": [
        { label: "Displayed text", type: "text" },
        { label: "Actual href", type: "text" },
        { label: "Domain reputation result", type: "text" },
        { label: "URL shortener used?", type: "select", options: ["Yes", "No", "Unknown"] },
        { label: "Redirect chain observed", type: "textarea", rows: 3 },
        { label: "Final landing page", type: "text" },
        { label: "Sandbox verdict / behaviors", type: "textarea", rows: 3 },
        { label: "User exposure (who clicked)", type: "textarea", rows: 2 },
      ],
      "attachment-analysis": [
        { label: "Filename", type: "text" },
        { label: "File type / size", type: "text" },
        { label: "Extension mismatch?", type: "select", options: ["Yes", "No", "Unknown"] },
        { label: "Macro/active content present?", type: "select", options: ["Yes", "No", "Unknown"] },
        { label: "AV / VirusTotal detections", type: "textarea", rows: 3 },
        { label: "Behavioral notes (sandbox)", type: "textarea", rows: 3 },
        { label: "User opened? (who/when)", type: "textarea", rows: 2 },
        { label: "Containment action", type: "textarea", rows: 2 },
      ],
      "phishing-type": [
        { label: "Type (credential/malware/BEC/data theft)", type: "text" },
        { label: "Target department / users", type: "text" },
        { label: "Impersonation of", type: "text" },
        { label: "Sophistication", type: "select", options: ["Low", "Medium", "High"] },
        { label: "Likely motive", type: "select", options: ["Financial", "Data", "Access", "Unknown"] },
        { label: "Urgency / tone indicators", type: "textarea", rows: 2 },
        { label: "Branding or language anomalies", type: "textarea", rows: 2 },
        { label: "Risk rating and rationale", type: "textarea", rows: 3 },
      ],
      "response-template": [
        { label: "Immediate actions", type: "textarea", rows: 3, placeholder: "Remove emails, block sender, notify recipients" },
        { label: "User protection", type: "textarea", rows: 3, placeholder: "Force resets, check MFA prompts" },
        { label: "Monitoring", type: "textarea", rows: 3, placeholder: "Hunt IOCs in mail/EDR/HTTP logs" },
        { label: "Lessons / long-term", type: "textarea", rows: 3, placeholder: "Update filters, training notes" },
        { label: "Owner and ETA", type: "text" },
      ],
      "red-flags": [
        { label: "Suspicious sender domain", type: "select", options: ["Yes", "No", "Unknown"] },
        { label: "Generic greeting", type: "select", options: ["Yes", "No"] },
        { label: "Urgent language", type: "select", options: ["Yes", "No"] },
        { label: "Link/text mismatch", type: "select", options: ["Yes", "No", "Unknown"] },
        { label: "Requests for credentials/MFA", type: "select", options: ["Yes", "No"] },
        { label: "Unexpected attachments", type: "select", options: ["Yes", "No"] },
        { label: "Unusual sender behavior", type: "textarea", rows: 2 },
        { label: "Branding/spelling issues", type: "textarea", rows: 2 },
      ],
      "escalation-procedure": [
        { label: "Reporter", type: "text" },
        { label: "Initial action taken", type: "textarea", rows: 2 },
        { label: "Verification channel used", type: "text" },
        { label: "Forwarded to (team/email)", type: "text" },
        { label: "Credential reset needed", type: "select", options: ["Yes", "No", "N/A"] },
        { label: "Notes", type: "textarea", rows: 3 },
      ],
    };
    const fields = map[optionId];
    if (!fields) return false;
    fields.forEach((f, idx) => {
      const row = document.createElement("label");
      row.className = "triage-field";
      row.dataset.fieldId = `phish-${optionId}-${idx}`;
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

  // Footer with back button
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      phishingAnalyzerState.screen = "intro";
      renderPhishingAnalyzerIntro(container);
    },
    onStopSpeech: stopPhishingAnalyzerSpeech,
  });

  container.appendChild(footer);
}

/**
 * Main render dispatcher
 */
export function renderPhishingAnalyzer(container) {
  if (!container) return;

  container.style.display = "flex";
  container.style.flexDirection = "column";

  // Display tool context at the top
  updateToolContextDisplay("phishing", container);

  if (phishingAnalyzerState.screen === "intro") {
    renderPhishingAnalyzerIntro(container);
  } else if (phishingAnalyzerState.screen === "result") {
    renderPhishingAnalyzerResult(container);
  }
}

/**
 * Speech handling
 */
let phishingAnalyzerSpeechUtterance = null;

export function speakPhishingAnalyzerMessage(text) {
  const ENABLE_PHISH_TTS = false;
  if (!ENABLE_PHISH_TTS) return;
  if (!text || window.isSpeechMuted || !("speechSynthesis" in window)) return;

  // Check global mute flag
  if (window.isSpeechMuted) return;

  if (phishingAnalyzerSpeechUtterance) {
    window.speechSynthesis.cancel();
  }

  phishingAnalyzerSpeechUtterance = new SpeechSynthesisUtterance(text);
  phishingAnalyzerSpeechUtterance.rate = 1;
  window.speechSynthesis.speak(phishingAnalyzerSpeechUtterance);
}

export function stopPhishingAnalyzerSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  phishingAnalyzerSpeechUtterance = null;
}

/**
 * Get state for debugging
 */
export function getPhishingAnalyzerState() {
  return { ...phishingAnalyzerState };
}

/**
 * Reset state
 */
export function resetPhishingAnalyzer() {
  initPhishingAnalyzer();
}

/**
 * Clear Phishing Analyzer state and re-render to landing state
 */
export function clearPhishingAnalyzer() {
  initPhishingAnalyzer();
  const container = document.getElementById("cipherDeepBody");
  if (container) {
    renderPhishingAnalyzer(container);
  }
}
