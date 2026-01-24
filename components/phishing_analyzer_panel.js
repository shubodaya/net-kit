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
  if (!text || !("speechSynthesis" in window)) return;

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
