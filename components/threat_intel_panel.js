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
    <p style="font-size: 12px; color: var(--muted, #999); margin: 8px 0 0 0;">
      Analysis template has been prefilled in the input below
    </p>
  `;

  container.appendChild(resultDiv);

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
  if (!text || !("speechSynthesis" in window)) return;

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
