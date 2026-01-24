/**
 * Tool Context Display Component
 * Renders tool summary and quick examples at top of Deep Chat panels
 * Provides consistent UI across all Deep Chat tools (Toolkit, Command Assist, Triage, Intel, Phishing, Compliance)
 */

import { getDeepChatToolContext } from "../data/tool_registry.js";

/**
 * Create tool context output component
 * @param {string} toolId - The tool ID (toolkit, commands, triage, intel, phishing, compliance)
 * @returns {HTMLElement} Container with tool context, summary, and example prompts
 */
export function createToolContextDisplay(toolId) {
  const context = getDeepChatToolContext(toolId);
  if (!context) return null;

  const container = document.createElement("div");
  container.className = "tool-context-display";

  // Header with tool name and icon
  const header = document.createElement("div");
  header.className = "tool-context-header";

  const title = document.createElement("h3");
  title.className = "tool-context-title";
  title.textContent = context.name;
  header.appendChild(title);

  container.appendChild(header);

  // Summary section
  const summarySection = document.createElement("div");
  summarySection.className = "tool-context-section";

  const summaryLabel = document.createElement("div");
  summaryLabel.className = "tool-context-label";
  summaryLabel.textContent = "About this tool:";
  summarySection.appendChild(summaryLabel);

  const summaryText = document.createElement("p");
  summaryText.className = "tool-context-text";
  summaryText.textContent = context.summary;
  summarySection.appendChild(summaryText);

  container.appendChild(summarySection);

  // Expected inputs section
  const inputsSection = document.createElement("div");
  inputsSection.className = "tool-context-section";

  const inputsLabel = document.createElement("div");
  inputsLabel.className = "tool-context-label";
  inputsLabel.textContent = "Expected inputs:";
  inputsSection.appendChild(inputsLabel);

  const inputsText = document.createElement("p");
  inputsText.className = "tool-context-text";
  inputsText.textContent = context.expectedInputs;
  inputsSection.appendChild(inputsText);

  container.appendChild(inputsSection);

  // Output format section
  const outputSection = document.createElement("div");
  outputSection.className = "tool-context-section";

  const outputLabel = document.createElement("div");
  outputLabel.className = "tool-context-label";
  outputLabel.textContent = "Output format:";
  outputSection.appendChild(outputLabel);

  const outputText = document.createElement("p");
  outputText.className = "tool-context-text";
  outputText.textContent = context.outputFormat;
  outputSection.appendChild(outputText);

  container.appendChild(outputSection);

  // Quick example prompts section
  const promptsSection = document.createElement("div");
  promptsSection.className = "tool-context-section tool-context-examples";

  const promptsLabel = document.createElement("div");
  promptsLabel.className = "tool-context-label";
  promptsLabel.textContent = "Quick examples:";
  promptsSection.appendChild(promptsLabel);

  const promptsList = document.createElement("ul");
  promptsList.className = "tool-context-prompts";

  context.examplePrompts.forEach((prompt) => {
    const promptItem = document.createElement("li");
    promptItem.className = "tool-context-prompt-item";
    promptItem.textContent = prompt;
    promptsList.appendChild(promptItem);
  });

  promptsSection.appendChild(promptsList);
  container.appendChild(promptsSection);

  return container;
}

/**
 * Update tool context display when switching tools
 * @param {string} toolId - The new tool ID
 * @param {HTMLElement} container - Container to render context into (typically at top of Deep Chat body)
 */
export function updateToolContextDisplay(toolId, container) {
  if (!container) return;

  // Remove old context if exists
  const oldContext = container.querySelector(".tool-context-display");
  if (oldContext) {
    oldContext.remove();
  }

  // Create and insert new context at top
  const contextDisplay = createToolContextDisplay(toolId);
  if (contextDisplay) {
    container.insertBefore(contextDisplay, container.firstChild);
  }
}
