/**
 * Incident Triage Panel - Structured incident response workflow
 * Integrated with options_panel.js for guided discovery
 */

import { renderOptionsPanel } from "./options_panel.js";
import { updateToolContextDisplay } from "./tool_context_display.js";
import {
  createPromptPanel,
  createFooterControls,
} from "./ui_components.js";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const TRIAGE_NOTES_KEY = "ck_triage_notes";

// State machine for Incident Triage
const incidentTriageState = {
  screen: "intro", // intro | options | result
  selectedCategory: null,
  selectedOption: null,
};

function getFirebaseUser() {
  return window?._firebase?.auth?.currentUser || null;
}

function getFirestoreDb() {
  return window?._firebase?.db || null;
}

async function askDraftName(defaultName) {
  const openPromptFn = window?.openPrompt;
  if (typeof openPromptFn === "function") {
    const result = await openPromptFn({
      title: "Save draft",
      message: "Enter a name for this draft.",
      placeholder: defaultName,
      confirmText: "Save",
      cancelText: "Cancel",
      requireInput: true,
    });
    if (result?.confirmed) {
      return result.value?.trim() || defaultName;
    }
    return null;
  }
  // Fallback to window.prompt if modal unavailable
  const name = prompt("Name this draft", defaultName);
  return name?.trim() || null;
}

async function saveTriageNote(body, optionId, categoryId) {
  const content = (body || "").trim();
  if (!content) return;
  const defaultName = content.split("\n").find((l) => l.trim()) || "Untitled incident";
  const name = await askDraftName(defaultName);
  if (!name) return;
  const payload = {
    id: `note-${Date.now()}`,
    name: name.trim().slice(0, 80),
    body: content,
    savedAt: new Date().toLocaleString(),
    optionId: optionId || "general",
    categoryId: categoryId || "general",
  };
  const list = await loadTriageNotes();
  list.unshift(payload);
  await saveTriageNotes(list.slice(0, 50));
  renderTriageSavedList();
}

async function loadTriageNotes() {
  const uid = getFirebaseUser()?.uid;
  const db = getFirestoreDb();
  if (uid && db) {
    try {
      const snap = await getDocs(collection(db, "users", uid, "triage_drafts"));
      const remote = snap.docs.map((d) => d.data()).filter(Boolean);
      if (remote.length) return remote;
    } catch (e) {
      console.warn("loadTriageNotes remote failed, falling back to local", e);
    }
  }
  try {
    const raw = localStorage.getItem(TRIAGE_NOTES_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveTriageNotes(list) {
  const uid = getFirebaseUser()?.uid;
  const db = getFirestoreDb();
  if (uid && db) {
    try {
      const saveOps = (list || []).map((item) =>
        setDoc(doc(db, "users", uid, "triage_drafts", item.id), item)
      );
      await Promise.all(saveOps);
    } catch (e) {
      console.warn("saveTriageNotes remote failed, writing local", e);
    }
  }
  try {
    localStorage.setItem(TRIAGE_NOTES_KEY, JSON.stringify(list || []));
  } catch {
    // ignore persist errors
  }
}

/**
 * Initialize Incident Triage
 */
export function initIncidentTriage() {
  incidentTriageState.screen = "intro";
  incidentTriageState.selectedCategory = null;
  incidentTriageState.selectedOption = null;
}

/**
 * Render Incident Triage intro
 */
export function renderIncidentTriageIntro(container) {
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";

  // Intro
  const intro = createPromptPanel(
    "🚨 Incident Triage",
    "Cipher here. Welcome to Incident Triage.",
    "I can help you with incident response workflows. Pick an assessment category below."
  );
  container.appendChild(intro);

  // Layout: options only (saved drafts are shown inside Initial Assessment result)
  const grid = document.createElement("div");
  grid.style.cssText = `
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    align-items: start;
  `;

  const optionsDiv = document.createElement("div");
  optionsDiv.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;
  renderOptionsPanel(optionsDiv, "incident_triage", (selection) => {
    incidentTriageState.selectedOption = selection;
    incidentTriageState.screen = "result";
    renderIncidentTriageResult(container);
    speakIncidentTriageMessage(`You selected ${selection.label}. Template loaded.`);

    const input = document.querySelector("#cipherAiInput");
    if (input) {
      input.value = selection.template;
      input.focus();
    }
  });
  grid.appendChild(optionsDiv);

  container.appendChild(grid);

  // Footer
  const footer = createFooterControls({
    showBack: false,
    showStopSpeech: true,
    onStopSpeech: stopIncidentTriageSpeech,
  });

  container.appendChild(footer);
}

/**
 * Render result after selection
 */
export function renderIncidentTriageResult(container) {
  if (!container || !incidentTriageState.selectedOption) return;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";

  const selection = incidentTriageState.selectedOption;

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

  // Editable workpad removed; use structured form only

  // Structured form derived from template
  const formWrap = document.createElement("div");
  formWrap.className = "triage-form";
  formWrap.innerHTML = `<div class="triage-form-head">
      <h4>Fill the fields</h4>
    </div>
    <div class="triage-form-body" id="triageDynamicForm"></div>`;
  container.appendChild(formWrap);

  const workpad = null;
  const formBody = formWrap.querySelector("#triageDynamicForm");
  if (selection.id === "initial-assessment") {
    buildInitialAssessmentForm(formBody);
  } else {
    buildTriageForm(selection.template || "", formBody, workpad);
  }

  // Saved drafts card for every triage subcategory
  const savedCard = document.createElement("div");
  savedCard.className = "triage-saved-card";
  savedCard.innerHTML = `
    <h4 style="margin:0;color:var(--ink);">Saved drafts</h4>
    <p class="muted" style="margin:0;">Name and save this draft to return later.</p>
    <button class="primary" style="width:100%;padding:12px 14px;font-weight:700;font-size:13px;" id="triageSaveCurrentBtn" type="button">Save current note</button>
    <div id="triageSavedListLocal" class="triage-saved-list"></div>
  `;
  const localSavedList = savedCard.querySelector("#triageSavedListLocal");
  container.appendChild(savedCard);

  // Wire save handler for this card
  const saveBtn = savedCard.querySelector("#triageSaveCurrentBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const body = composeFormText(formWrap.querySelector("#triageDynamicForm"));
      await saveTriageNote(body, selection.optionId, selection.categoryId);
      await renderTriageSavedList(localSavedList, selection.optionId, selection.categoryId, formBody);
    });
  }
  renderTriageSavedList(localSavedList, selection.optionId, selection.categoryId, formBody);

  // Footer with back button
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      incidentTriageState.screen = "intro";
      renderIncidentTriageIntro(container);
    },
    onStopSpeech: stopIncidentTriageSpeech,
  });

  container.appendChild(footer);
}

/**
 * Main render dispatcher
 */
export function renderIncidentTriage(container) {
  if (!container) return;

  container.style.display = "flex";
  container.style.flexDirection = "column";

  // Display tool context at the top
  updateToolContextDisplay("triage", container);

  if (incidentTriageState.screen === "intro") {
    renderIncidentTriageIntro(container);
  } else if (incidentTriageState.screen === "result") {
    renderIncidentTriageResult(container);
  }
}

/**
 * Speech handling
 */
let incidentTriageSpeechUtterance = null;

export function speakIncidentTriageMessage(text) {
  const ENABLE_TRIAGE_TTS = false;
  if (!ENABLE_TRIAGE_TTS) return;
  if (!text || window.isSpeechMuted || !("speechSynthesis" in window)) return;

  // Check global mute flag
  if (window.isSpeechMuted) return;

  if (incidentTriageSpeechUtterance) {
    window.speechSynthesis.cancel();
  }

  incidentTriageSpeechUtterance = new SpeechSynthesisUtterance(text);
  incidentTriageSpeechUtterance.rate = 1;
  window.speechSynthesis.speak(incidentTriageSpeechUtterance);
}

export function stopIncidentTriageSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  incidentTriageSpeechUtterance = null;
}

/**
 * Get state for debugging
 */
export function getIncidentTriageState() {
  return { ...incidentTriageState };
}

/**
 * Reset state
 */
export function resetIncidentTriage() {
  initIncidentTriage();
}

/**
 * Clear Incident Triage state and re-render to landing state
 */
export function clearIncidentTriage() {
  initIncidentTriage();
  const container = document.getElementById("cipherDeepBody");
  if (container) {
    renderIncidentTriage(container);
  }
}

function wireTriageSaveHandler(container) {
  const saveBtn = container.querySelector("#triageSaveCurrentBtn");
  if (!saveBtn) return;
  saveBtn.addEventListener("click", () => {
    const body = composeFormText(container.querySelector("#triageDynamicForm"));
    saveTriageNote(body);
  });
}

async function renderTriageSavedList(targetEl, optionId, categoryId, formBodyRef) {
  const listEl = targetEl || document.getElementById("triageSavedList");
  if (!listEl) return;
  const notes = (await loadTriageNotes()).filter((n) => {
    const optMatch = optionId ? n.optionId === optionId : true;
    const catMatch = categoryId ? n.categoryId === categoryId : true;
    return optMatch && catMatch;
  });
  listEl.innerHTML = "";
  if (!notes.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No saved assessments yet.";
    listEl.appendChild(empty);
    return;
  }
  notes.forEach((note) => {
    const row = document.createElement("div");
    row.className = "triage-saved-row";
    row.innerHTML = `
      <div>
        <div class="label">${note.name}</div>
        <div class="meta">${note.savedAt || ""}</div>
      </div>
      <div class="triage-saved-actions">
        <button class="chip" data-load-note="${note.id}">Load</button>
        <button class="chip ghost" data-delete-note="${note.id}">Delete</button>
      </div>
    `;
    row.querySelector("[data-load-note]")?.addEventListener("click", async () => {
      const formBody = formBodyRef || document.querySelector("#triageDynamicForm");
      if (formBody) {
        // Attempt to map values back into the current form fields if labels match
        const lines = (note.body || "").split("\n");
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
      } else {
        const input = document.querySelector("#cipherAiInput");
        if (input) {
          input.value = note.body || note.name || "";
          input.focus();
        }
      }
    });
    row.querySelector("[data-delete-note]")?.addEventListener("click", async () => {
      const uid = getFirebaseUser()?.uid;
      const db = getFirestoreDb();
      if (uid && db) {
        try {
          await deleteDoc(doc(db, "users", uid, "triage_drafts", note.id));
        } catch (e) {
          console.warn("delete remote failed", e);
        }
      }
      const updated = (await loadTriageNotes()).filter((n) => n.id !== note.id);
      await saveTriageNotes(updated);
      renderTriageSavedList(listEl, optionId);
    });
    listEl.appendChild(row);
  });
}

function buildTriageForm(templateText, target, workpad) {
  if (!target) return;
  target.innerHTML = "";
  const lines = (templateText || "").split("\n").map((l) => l.trim());
  const fields = [];
  lines.forEach((line, idx) => {
    if (!line) return;
    // Checkbox style "- [ ] Item"
    if (/^-?\s*\[\s*\]/.test(line)) {
      const label = line.replace(/^-?\s*\[\s*\]\s*/, "") || `Item ${idx + 1}`;
      const id = `tf-${idx}-${label.replace(/\W+/g, "-")}`;
      const row = document.createElement("label");
      row.className = "triage-field checkbox";
      row.innerHTML = `<input type="checkbox" id="${id}"><span>${label}</span>`;
      target.appendChild(row);
      fields.push({ type: "checkbox", label, id });
      return;
    }
    const parts = line.split(":");
    if (parts.length >= 2) {
      const label = parts[0].trim() || `Field ${idx + 1}`;
      const placeholder = parts.slice(1).join(":").trim();
      const id = `tf-${idx}-${label.replace(/\W+/g, "-")}`;
      const row = document.createElement("label");
      row.className = "triage-field";
      row.setAttribute("for", id);
      row.innerHTML = `
        <span>${label}</span>
        <input type="text" id="${id}" placeholder="${placeholder}">
      `;
      target.appendChild(row);
      fields.push({ type: "text", label, id });
    }
  });

  const syncToWorkpad = () => {
    if (!workpad) return;
    const linesOut = fields.map((f) => {
      const el = document.getElementById(f.id);
      if (!el) return "";
      if (f.type === "checkbox") {
        return `${f.label}: ${el.checked ? "Yes" : "No"}`;
      }
      return `${f.label}: ${el.value || ""}`;
    });
    workpad.value = linesOut.filter(Boolean).join("\n");
  };

  fields.forEach((f) => {
    const el = document.getElementById(f.id);
    if (!el) return;
    el.addEventListener("input", syncToWorkpad);
    if (f.type === "checkbox") {
      el.addEventListener("change", syncToWorkpad);
    }
  });

  syncToWorkpad();
}

function buildInitialAssessmentForm(target) {
  if (!target) return;
  target.innerHTML = "";
  const fields = [
    { label: "Incident ID", type: "text", placeholder: "INC-2026-001" },
    { label: "Reported by / Contact", type: "text", placeholder: "Name, email/phone" },
    { label: "Detected (UTC)", type: "text", placeholder: "2026-01-26 14:30 UTC" },
    { label: "Incident type", type: "select", options: ["Phishing", "Malware", "Breach", "Other"] },
    { label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
    { label: "Business impact (users/systems/data)", type: "textarea", rows: 3 },
    { label: "Scope (hosts/apps/locations)", type: "textarea", rows: 3 },
    { label: "Current status", type: "select", options: ["Ongoing", "Contained", "Unknown"] },
    { label: "Evidence summary", type: "textarea", rows: 4 },
    { label: "Immediate actions taken", type: "textarea", rows: 3 },
    { label: "Risks/concerns", type: "textarea", rows: 3 },
    { label: "Decision/approval needed next", type: "textarea", rows: 2 },
  ];

  fields.forEach((f, idx) => {
    const row = document.createElement("label");
    row.className = "triage-field";
    row.dataset.fieldId = `ia-${idx}`;
    const labelEl = document.createElement("span");
    labelEl.textContent = f.label;
    row.appendChild(labelEl);
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
}

function composeFormText(formBody) {
  if (!formBody) return "";
  const rows = formBody.querySelectorAll(".triage-field");
  const lines = [];
  rows.forEach((row) => {
    const labelEl = row.querySelector("span");
    const label = labelEl?.textContent?.trim() || "Field";
    const input = row.querySelector("input[type='text']");
    const checkbox = row.querySelector("input[type='checkbox']");
    if (input) {
      lines.push(`${label}: ${input.value || ""}`);
    } else if (checkbox) {
      lines.push(`${label}: ${checkbox.checked ? "Yes" : "No"}`);
    } else {
      const ta = row.querySelector("textarea");
      const sel = row.querySelector("select");
      if (ta) {
        lines.push(`${label}: ${ta.value || ""}`);
      } else if (sel) {
        lines.push(`${label}: ${sel.value || ""}`);
      }
    }
  });
  return lines.join("\n");
}
