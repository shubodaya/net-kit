/**
 * Tool Kit Panel - Guided tool discovery and help interface
 * Replaces the old "Web Tools" bot with a comprehensive tool explorer
 * Now integrated with options_panel.js for unified tool options experience
 */

import { getAllTools, getTool } from "../data/tool_registry.js";
import { renderOptionsPanel } from "./options_panel.js";
import { updateToolContextDisplay } from "./tool_context_display.js";
import {
  createFooterControls,
  createPromptPanel,
  createToolDetailsCard,
} from "./ui_components.js";

function showToolKitInfo(selection) {
  const title = selection.label || "Tool info";
  const desc = selection.info || "No description provided.";
  const example = selection.example || "NA";
  // Add a blank line before the example content and after it for clarity
  const message = `Description:\n${desc}\n\nExample:\n\n${example}\n`;
  const openPromptFn = window?.openPrompt;
  if (typeof openPromptFn === "function") {
    openPromptFn({
      title,
      message,
      confirmText: "OK",
      cancelText: "Close",
      requireInput: false,
    });
  } else {
    alert(message);
  }
}

// State machine for Tool Kit panel
const toolKitState = {
  screen: "intro", // intro | options | details | exploring
  selectedTool: null,
  history: [],
};

/**
 * Initialize Tool Kit panel
 */
export function initToolKit() {
  toolKitState.screen = "intro";
  toolKitState.selectedTool = null;
  toolKitState.history = [];
}

/**
 * Render Tool Kit intro screen with options
 */
export function renderToolKitIntro(container) {
  if (!container) return;

  // CRITICAL FIX: Ensure container is visible and has proper display
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";

  // Title and introduction
  const intro = createPromptPanel(
    "🛠️ Tool Kit",
    "Cipher here. Welcome to the Tool Kit.",
    "I can help you understand and use any of the tools in Net Kit. Pick a category below to explore."
  );

  container.appendChild(intro);

  // Use unified options panel for guided tool selection
  const optionsDiv = document.createElement("div");
  optionsDiv.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;

  renderOptionsPanel(optionsDiv, "toolkit", (selection) => {
    // Show brief info about the tool
    showToolKitInfo(selection);
    // Prefill input for further actions
    speakToolKitMessage(`You selected ${selection.label}. Using template: ${selection.template}`);

    // Get the deep chat input
    const input = document.querySelector("#cipherAiInput");
    if (input) {
      input.value = selection.template;
      input.focus();
    }
  });

  container.appendChild(optionsDiv);

  // Footer controls (no Back on intro, but Stop Speaking always)
  const footer = createFooterControls({
    showBack: false,
    showStopSpeech: true,
    onStopSpeech: stopAllSpeechForToolKit,
  });

  container.appendChild(footer);
}

/**
 * Render Tool Kit details screen
 */
export function renderToolKitDetails(container) {
  if (!container || !toolKitState.selectedTool) return;

  const tool = getTool(toolKitState.selectedTool);
  if (!tool) return;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";

  // Tool details card
  const detailsCard = createToolDetailsCard(tool);
  container.appendChild(detailsCard);

  // Prompt for next action
  const prompt = createPromptPanel(
    "Pick another tool to know more.",
    "",
    `<em>Or use the controls below to navigate.</em>`
  );
  container.appendChild(prompt);

  // Footer controls (Back and Stop Speaking)
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      toolKitState.screen = "intro";
      renderToolKitIntro(container);
      speakToolKitMessage("Back to tool list.");
    },
    onStopSpeech: stopAllSpeechForToolKit,
  });

  container.appendChild(footer);
}

/**
 * Main render function for Tool Kit
 */
export function renderToolKit(container) {
  if (!container) return;

  // CRITICAL FIX: Ensure container display is set
  container.style.display = "flex";
  container.style.flexDirection = "column";

  // Display tool context at the top
  updateToolContextDisplay("toolkit", container);

  if (toolKitState.screen === "intro") {
    renderToolKitIntro(container);
  } else if (toolKitState.screen === "details") {
    renderToolKitDetails(container);
  }
}

/**
 * Handle Tool Kit speech
 */
let toolKitSpeechUtterance = null;

export function speakToolKitMessage(text) {
  const ENABLE_TOOLKIT_TTS = false;
  if (!ENABLE_TOOLKIT_TTS) return;
  if (!text || !("speechSynthesis" in window)) return;

  // Check global mute flag
  if (window.isSpeechMuted) return;

  if (toolKitSpeechUtterance) {
    window.speechSynthesis.cancel();
  }

  toolKitSpeechUtterance = new SpeechSynthesisUtterance(text);
  toolKitSpeechUtterance.rate = 1;
  window.speechSynthesis.speak(toolKitSpeechUtterance);
}

export function stopAllSpeechForToolKit() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  toolKitSpeechUtterance = null;
}

/**
 * Get current Tool Kit state for debugging
 */
export function getToolKitState() {
  return { ...toolKitState };
}

/**
 * Reset Tool Kit state
 */
export function resetToolKit() {
  initToolKit();
}

/**
 * Clear Tool Kit state and re-render to landing state
 */
export function clearToolKit() {
  initToolKit();
  const container = document.getElementById("cipherDeepBody");
  if (container) {
    renderToolKit(container);
  }
}
