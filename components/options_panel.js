/**
 * Options Panel Component
 * Reusable component for rendering guided tool options across all Deep Chat tools
 * Provides unified UX for category selection, option selection, and template prefilling
 */

import { getToolOptions, getToolCategories, getCategoryOptions } from "../data/tool_options.js";

// State management for options panel
const optionsPanelState = {
  toolId: null,
  screen: "categories", // "categories", "options", "selected"
  selectedCategory: null,
  selectedOption: null,
};

/**
 * Reset options panel state
 */
export function resetOptionsPanelState(toolId) {
  optionsPanelState.toolId = toolId;
  optionsPanelState.screen = "categories";
  optionsPanelState.selectedCategory = null;
  optionsPanelState.selectedOption = null;
}

/**
 * Get current options panel state
 */
export function getOptionsPanelState() {
  return { ...optionsPanelState };
}

/**
 * Update options panel state
 */
export function updateOptionsPanelState(updates) {
  Object.assign(optionsPanelState, updates);
}

/**
 * Main render function - handles all screens
 */
export function renderOptionsPanel(container, toolId, onSelectOption, onBack) {
  if (!container) return;

  resetOptionsPanelState(toolId);
  const tool = getToolOptions(toolId);

  if (!tool) {
    container.innerHTML = `<div class="error-message">Tool not found: ${toolId}</div>`;
    return;
  }

  // Clear and render
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "16px";

  // Render intro
  renderToolIntro(container, tool);

  // Render categories/options based on state
  if (optionsPanelState.screen === "categories") {
    renderCategorySelection(container, toolId, onSelectOption, onBack);
  }
}

/**
 * Render tool intro header
 */
function renderToolIntro(container, tool) {
  const introDiv = document.createElement("div");
  introDiv.className = "options-intro";
  introDiv.style.cssText = `
    padding: 12px 0 4px 0;
    margin-bottom: 0;
    border-bottom: none;
  `;

  introDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 24px;">${tool.icon || "🔧"}</span>
      <div>
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${tool.name}</h3>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--muted, #999);">${tool.description}</p>
      </div>
    </div>
  `;

  container.appendChild(introDiv);
}

/**
 * Render category selection screen
 */
function renderCategorySelection(container, toolId, onSelectOption, onBack) {
  const categories = getToolCategories(toolId);

  if (categories.length === 0) {
    container.innerHTML += `<div class="error-message">No categories available</div>`;
    return;
  }

  // Create category grid
  const gridDiv = document.createElement("div");
  gridDiv.className = "options-grid";
  gridDiv.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin: 12px 0;
  `;

  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.className = "option-button";
    // Add data-tool-type attribute: "command-assist" or "non-command-assist"
    const toolType = toolId === "commands" ? "command-assist" : "non-command-assist";
    btn.setAttribute("data-tool-type", toolType);

    btn.innerHTML = `<div style="text-align: center;">${category.label}</div>`;

    btn.addEventListener("click", function () {
      optionsPanelState.selectedCategory = category.id;
      optionsPanelState.screen = "options";
      renderOptionSelection(container, toolId, category.id, onSelectOption, onBack);
    });

    gridDiv.appendChild(btn);
  });

  container.appendChild(gridDiv);

  // Add footer with back button
  addPanelFooter(container, false, onBack);
}

/**
 * Render option selection within a category
 */
function renderOptionSelection(container, toolId, categoryId, onSelectOption, onBack) {
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "16px";

  const tool = getToolOptions(toolId);
  const category = getToolCategories(toolId).find((c) => c.id === categoryId);
  const options = getCategoryOptions(toolId, categoryId);

  if (!category || !options.length) {
    container.innerHTML = `<div class="error-message">No options available</div>`;
    return;
  }

  // Re-render intro
  renderToolIntro(container, tool);

  // Back button + category name
  const headerDiv = document.createElement("div");
  headerDiv.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  `;

  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back";
  backBtn.style.cssText = `
    padding: 6px 12px;
    background: transparent;
    border: 1px solid var(--edge, #ddd);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    color: var(--text, #000);
  `;
  backBtn.addEventListener("click", function () {
    optionsPanelState.screen = "categories";
    renderOptionsPanel(container, toolId, onSelectOption, onBack);
  });

  const categoryLabel = document.createElement("span");
  categoryLabel.textContent = category.label;
  categoryLabel.style.cssText = `
    font-weight: 600;
    color: var(--text, #000);
  `;

  headerDiv.appendChild(backBtn);
  headerDiv.appendChild(categoryLabel);
  container.appendChild(headerDiv);

  // Options grid
  const gridDiv = document.createElement("div");
  gridDiv.className = "options-grid";
  gridDiv.style.cssText = `
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin: 12px 0;
  `;

  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option-button";
    // Add data-tool-type attribute: "command-assist" or "non-command-assist"
    const toolType = toolId === "commands" ? "command-assist" : "non-command-assist";
    btn.setAttribute("data-tool-type", toolType);

    btn.innerHTML = `
      <div style="font-weight: 600; font-size: 14px;">${option.label}</div>
      <div style="font-size: 12px; color: var(--muted, #999); margin-top: 4px;">${option.example || ""}</div>
    `;

    btn.addEventListener("click", function () {
      // Call the callback with template and metadata
      onSelectOption({
        toolId,
        categoryId,
        optionId: option.id,
        label: option.label,
        template: option.template,
        info: option.info || option.description || "",
        example: option.example || "",
      });
    });

    gridDiv.appendChild(btn);
  });

  container.appendChild(gridDiv);

  // Add footer
  addPanelFooter(container, true, onBack);
}

/**
 * Add footer with back button
 */
function addPanelFooter(container, hasBackButton, onBack) {
  const footerDiv = document.createElement("div");
  footerDiv.className = "options-footer";
  footerDiv.style.cssText = `
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--edge, #ddd);
  `;

  if (hasBackButton) {
    const backBtn = document.createElement("button");
    backBtn.textContent = "← Back to Categories";
    backBtn.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      background: var(--panel, #f5f5f5);
      border: 1px solid var(--edge, #ddd);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      color: var(--text, #000);
    `;
    backBtn.addEventListener("click", function () {
      optionsPanelState.screen = "categories";
      renderOptionsPanel(container, optionsPanelState.toolId, onBack);
    });
    footerDiv.appendChild(backBtn);
  }

  if (onBack) {
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕ Close";
    closeBtn.style.cssText = `
      padding: 8px 12px;
      background: transparent;
      border: 1px solid var(--edge, #ddd);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      color: var(--muted, #999);
    `;
    closeBtn.addEventListener("click", onBack);
    footerDiv.appendChild(closeBtn);
  }

  container.appendChild(footerDiv);
}
