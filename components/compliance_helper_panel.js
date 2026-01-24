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
    <p style="font-size: 12px; color: var(--muted, #999); margin: 8px 0 0 0;">
      Compliance template has been prefilled in the input below
    </p>
  `;

  container.appendChild(resultDiv);

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
  if (!text || !("speechSynthesis" in window)) return;

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
