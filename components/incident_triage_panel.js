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

// State machine for Incident Triage
const incidentTriageState = {
  screen: "intro", // intro | options | result
  selectedCategory: null,
  selectedOption: null,
};

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

  // Options panel for guided selection
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
    speakIncidentTriageMessage(
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
    <p style="font-size: 12px; color: var(--muted, #999); margin: 8px 0 0 0;">
      Template has been prefilled in the input below
    </p>
  `;

  container.appendChild(resultDiv);

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
  if (!text || !("speechSynthesis" in window)) return;

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
