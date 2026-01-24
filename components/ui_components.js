/**
 * UI Components for Deep Chat panels
 * Reusable components with consistent styling and accessibility
 */

import { formatCiscoCommand, prepareCommandForCopy } from "./command_formatter.js";

/**
 * Create reusable code block renderer with copy button
 * Preserves spacing, indentation, and line breaks
 * Used for both commands and example outputs
 * @param {string} title - Section title
 * @param {string} content - Code content (can contain newlines and spaces)
 * @param {boolean} formatAsCommand - Whether to apply formatCiscoCommand formatting
 * @returns {HTMLElement} Container with pre/code and copy button
 */
export function createCodeBlock(title, content, formatAsCommand = false) {
  const container = document.createElement("div");
  container.className = "command-section";

  // Add title if provided
  if (title) {
    const titleEl = document.createElement("h4");
    titleEl.textContent = title;
    container.appendChild(titleEl);
  }

  // Format content if requested
  const displayContent = formatAsCommand ? formatCiscoCommand(content) : content;

  // Create pre/code block
  const preEl = document.createElement("pre");
  preEl.className = "command-code-pre";
  const codeEl = document.createElement("code");
  codeEl.className = "command-code";
  codeEl.textContent = displayContent;
  preEl.appendChild(codeEl);
  container.appendChild(preEl);

  // Add copy button
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "chip copy-btn";
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", () => {
    const textToCopy = formatAsCommand ? prepareCommandForCopy(content) : content;
    navigator.clipboard.writeText(textToCopy);
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 2000);
  });
  container.appendChild(copyBtn);

  return container;
}

/**
 * Create an option grid/button layout with responsive wrapping
 * @param {Array<{label: string, value: string, icon?: string}>} options - Options to render
 * @param {Function} onSelect - Callback when option selected
 * @param {string} containerClass - CSS class for container (optional)
 * @returns {HTMLElement} Container element
 */
export function createOptionGrid(options, onSelect, containerClass = "", toolType = "command-assist") {
  const container = document.createElement("div");
  container.className = `chip-row option-grid ${containerClass}`;
  container.setAttribute("role", "group");

  options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip option-button";
    button.dataset.value = option.value || option.label;
    button.setAttribute("role", "button");
    button.setAttribute("tabindex", index === 0 ? "0" : "-1");
    button.setAttribute("data-tool-type", toolType);

    // Build button content with optional icon
    if (option.icon) {
      const icon = document.createElement("span");
      icon.className = "option-icon";
      icon.textContent = option.icon;
      button.appendChild(icon);
    }

    const label = document.createElement("span");
    label.className = "option-label";
    label.textContent = option.label;
    button.appendChild(label);

    // Keyboard navigation
    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(option);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = button.nextElementSibling;
        if (next) next.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = button.previousElementSibling;
        if (prev) prev.focus();
      }
    });

    button.addEventListener("click", () => {
      onSelect(option);
    });

    container.appendChild(button);
  });

  return container;
}

/**
 * Create footer control bar with Back and Stop Speaking
 * @param {Object} config - Configuration
 * @param {Function} config.onBack - Callback for back button
 * @param {Function} config.onStopSpeech - Callback for stop speaking
 * @param {boolean} config.showBack - Show back button (default: true)
 * @param {boolean} config.showStopSpeech - Show stop speaking button (default: true)
 * @returns {HTMLElement} Footer element
 */
export function createFooterControls(config = {}) {
  const {
    onBack = () => {},
    onStopSpeech = () => {},
    showBack = true,
    showStopSpeech = true,
  } = config;

  const footer = document.createElement("div");
  footer.className = "cipher-footer-controls";
  footer.setAttribute("role", "toolbar");
  footer.setAttribute("aria-label", "Panel controls");

  // Back button
  if (showBack) {
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "chip back-button";
    backBtn.setAttribute("aria-label", "Go back to previous step");
    backBtn.innerHTML = '<span class="back-icon">←</span><span>Back</span>';
    backBtn.addEventListener("click", onBack);
    footer.appendChild(backBtn);
  }

  // Spacer
  const spacer = document.createElement("div");
  spacer.className = "footer-spacer";
  footer.appendChild(spacer);

  // Stop Speaking button
  if (showStopSpeech) {
    const stopBtn = document.createElement("button");
    stopBtn.type = "button";
    stopBtn.className = "chip stop-speak-button";
    stopBtn.id = "panelStopSpeakBtn";
    stopBtn.setAttribute("aria-label", "Stop text-to-speech playback");
    stopBtn.innerHTML = '<span class="stop-icon">⏹</span><span>Stop speaking</span>';
    stopBtn.addEventListener("click", onStopSpeech);
    footer.appendChild(stopBtn);
  }

  return footer;
}

/**
 * Create a prompt/instruction panel
 * @param {string} title - Main title/prompt
 * @param {string} subtitle - Optional subtitle or instruction
 * @param {string} content - Optional detailed content
 * @returns {HTMLElement} Prompt container
 */
export function createPromptPanel(title, subtitle = "", content = "") {
  const panel = document.createElement("div");
  panel.className = "prompt-panel";

  const titleEl = document.createElement("h3");
  titleEl.className = "prompt-title";
  titleEl.textContent = title;
  panel.appendChild(titleEl);

  if (subtitle) {
    const subtitleEl = document.createElement("p");
    subtitleEl.className = "prompt-subtitle";
    subtitleEl.textContent = subtitle;
    panel.appendChild(subtitleEl);
  }

  if (content) {
    const contentEl = document.createElement("div");
    contentEl.className = "prompt-content";
    contentEl.innerHTML = content;
    panel.appendChild(contentEl);
  }

  return panel;
}

/**
 * Create a tool details card
 * @param {Object} tool - Tool data with properties
 * @returns {HTMLElement} Tool details element
 */
export function createToolDetailsCard(tool) {
  const card = document.createElement("div");
  card.className = "tool-details-card";

  // Header
  const header = document.createElement("div");
  header.className = "tool-header";

  const titleEl = document.createElement("h2");
  titleEl.className = "tool-title";
  titleEl.textContent = (tool.icon || "") + " " + tool.name;
  header.appendChild(titleEl);

  const categoryEl = document.createElement("span");
  categoryEl.className = "tool-category";
  categoryEl.textContent = tool.category || "General";
  header.appendChild(categoryEl);

  card.appendChild(header);

  // Purpose
  const purposeEl = document.createElement("div");
  purposeEl.className = "tool-section";
  purposeEl.innerHTML = `
    <h4>Purpose</h4>
    <p>${escapeHtml(tool.purpose || tool.description || "No description available")}</p>
  `;
  card.appendChild(purposeEl);

  // Description
  if (tool.description) {
    const descEl = document.createElement("div");
    descEl.className = "tool-section";
    descEl.innerHTML = `
      <h4>Description</h4>
      <p>${escapeHtml(tool.description)}</p>
    `;
    card.appendChild(descEl);
  }

  // How to Use
  if (tool.howToUse && tool.howToUse.length) {
    const howEl = document.createElement("div");
    howEl.className = "tool-section";
    howEl.innerHTML = "<h4>How to Use</h4>";
    const ol = document.createElement("ol");
    tool.howToUse.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      ol.appendChild(li);
    });
    howEl.appendChild(ol);
    card.appendChild(howEl);
  }

  // Inputs & Outputs
  if (tool.inputs || tool.outputs) {
    const ioEl = document.createElement("div");
    ioEl.className = "tool-section";
    if (tool.inputs) {
      const inputLabel = document.createElement("h4");
      inputLabel.textContent = "Inputs";
      ioEl.appendChild(inputLabel);
      const inputText = document.createElement("p");
      inputText.textContent = tool.inputs;
      ioEl.appendChild(inputText);
    }
    if (tool.outputs) {
      const outputLabel = document.createElement("h4");
      outputLabel.textContent = "Outputs";
      ioEl.appendChild(outputLabel);
      const outputText = document.createElement("p");
      outputText.textContent = tool.outputs;
      ioEl.appendChild(outputText);
    }
    card.appendChild(ioEl);
  }

  // Example
  if (tool.example) {
    const exEl = document.createElement("div");
    exEl.className = "tool-section example-section";
    exEl.innerHTML = `
      <h4>Example</h4>
      <div class="example-input"><strong>Input:</strong> ${escapeHtml(tool.example.input || "")}</div>
      <div class="example-output"><strong>Output:</strong> ${escapeHtml(tool.example.output || "")}</div>
    `;
    card.appendChild(exEl);
  }

  // Common Errors
  if (tool.commonErrors && tool.commonErrors.length) {
    const errEl = document.createElement("div");
    errEl.className = "tool-section";
    errEl.innerHTML = "<h4>Common Errors</h4>";
    const ul = document.createElement("ul");
    tool.commonErrors.forEach((error) => {
      const li = document.createElement("li");
      li.textContent = error;
      ul.appendChild(li);
    });
    errEl.appendChild(ul);
    card.appendChild(errEl);
  }

  return card;
}

/**
 * Create a command result card
 * @param {Object} result - Command result data
 * @returns {HTMLElement} Result card element
 */
export function createCommandResultCard(result) {
  const card = document.createElement("div");
  card.className = "command-result-card";

  if (result.command) {
    // Use reusable code block renderer for command
    const cmdBlock = createCodeBlock("Command", result.command, true);
    card.appendChild(cmdBlock);
  }

  if (result.explanation) {
    const expEl = document.createElement("div");
    expEl.className = "command-section";
    expEl.innerHTML = `<h4>Explanation</h4><p>${escapeHtml(result.explanation)}</p>`;
    card.appendChild(expEl);
  }

  if (result.warning) {
    const warnEl = document.createElement("div");
    warnEl.className = "command-section warning-section";
    warnEl.innerHTML = `<h4>⚠ Warning</h4><p>${escapeHtml(result.warning)}</p>`;
    card.appendChild(warnEl);
  }

  if (result.example) {
    // Use same code block renderer for example (preserves formatting)
    const exBlock = createCodeBlock("Example Output", result.example, false);
    card.appendChild(exBlock);
  }

  if (result.variations && result.variations.length) {
    const varEl = document.createElement("div");
    varEl.className = "command-section";
    varEl.innerHTML = "<h4>Variations</h4>";
    const ul = document.createElement("ul");
    result.variations.forEach((v) => {
      const li = document.createElement("li");
      li.textContent = v;
      ul.appendChild(li);
    });
    varEl.appendChild(ul);
    card.appendChild(varEl);
  }

  if (result.troubleshooting && result.troubleshooting.length) {
    const tsEl = document.createElement("div");
    tsEl.className = "command-section";
    tsEl.innerHTML = "<h4>Troubleshooting</h4>";
    const ul = document.createElement("ul");
    result.troubleshooting.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
    tsEl.appendChild(ul);
    card.appendChild(tsEl);
  }

  return card;
}

/**
 * Create enhanced option card grid with better clarity and visuals
 * Used for Command Assist and tools to improve discoverability
 * @param {Array<{label: string, value: string, icon?: string, description?: string}>} options
 * @param {Function} onSelect - Callback when option selected
 * @param {string} toolType - Tool type for styling: "command-assist" or "non-command-assist" (default: "command-assist")
 * @returns {HTMLElement} Container with card-style options
 */
export function createEnhancedOptionGrid(options, onSelect, toolType = "command-assist") {
  const container = document.createElement("div");
  container.className = "enhanced-option-grid";

  options.forEach((option) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "enhanced-option-card";
    card.setAttribute("aria-label", option.label);
    card.setAttribute("data-tool-type", toolType);

    // Card structure
    const cardInner = document.createElement("div");
    cardInner.className = "enhanced-option-inner";

    // Icon
    if (option.icon) {
      const iconEl = document.createElement("div");
      iconEl.className = "enhanced-option-icon";
      iconEl.textContent = option.icon;
      cardInner.appendChild(iconEl);
    }

    // Content
    const contentEl = document.createElement("div");
    contentEl.className = "enhanced-option-content";

    const labelEl = document.createElement("div");
    labelEl.className = "enhanced-option-label";
    labelEl.textContent = option.label;
    contentEl.appendChild(labelEl);

    if (option.description) {
      const descEl = document.createElement("div");
      descEl.className = "enhanced-option-description";
      descEl.textContent = option.description;
      contentEl.appendChild(descEl);
    }

    cardInner.appendChild(contentEl);
    card.appendChild(cardInner);

    card.addEventListener("click", () => {
      onSelect(option);
    });

    container.appendChild(card);
  });

  return container;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
