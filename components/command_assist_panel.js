/**
 * Command Assist Panel - Multi-step guided command discovery
 * Implements systematic platform/vendor selection with action-based results
 */

import {
  getPlatforms,
  getPlatform,
  getVendors,
  getVendor,
  getVendorActions,
  getPlatformCategories,
  commandRegistry,
} from "../data/command_registry.js";
import { updateToolContextDisplay } from "./tool_context_display.js";
import {
  createOptionGrid,
  createEnhancedOptionGrid,
  createFooterControls,
  createPromptPanel,
  createCommandResultCard,
} from "./ui_components.js";

// State machine for Command Assist
const commandAssistState = {
  step: "platform-selection", // platform-selection | platform-action | vendor-selection | vendor-action | result
  selectedPlatform: null,
  selectedPlatformAction: null,
  selectedVendor: null,
  selectedVendorAction: null,
  selectedVendorCategoryLabel: null,
  commandResult: null,
  history: [],
};

/**
 * Initialize Command Assist
 */
export function initCommandAssist() {
  commandAssistState.step = "platform-selection";
  commandAssistState.selectedPlatform = null;
  commandAssistState.selectedPlatformAction = null;
  commandAssistState.selectedVendor = null;
  commandAssistState.selectedVendorAction = null;
  commandAssistState.selectedVendorCategoryLabel = null;
  commandAssistState.commandResult = null;
  commandAssistState.history = [];
}

/**
 * Render platform selection screen
 */
export function renderPlatformSelection(container) {
  if (!container) return;

  container.innerHTML = "";

  // Introduction
  const intro = createPromptPanel(
    "🔧 Command Assist",
    "Cipher here. I'll help you find the right command.",
    "First, tell me which platform or device type you need commands for."
  );
  container.appendChild(intro);

  // Platform options
  const platformOptions = [
    { label: "Windows", value: "windows", icon: "🪟" },
    { label: "Linux", value: "linux", icon: "🐧" },
    { label: "macOS", value: "macos", icon: "🍎" },
    { label: "Firewall", value: "firewall-vendor", icon: "🛡️" },
    { label: "Router", value: "router-vendor", icon: "🔄" },
    { label: "Switch", value: "switch-vendor", icon: "🔌" },
  ];

  const optionGrid = createOptionGrid(platformOptions, (option) => {
    const deviceType = option.value;

    if (["windows", "linux", "macos"].includes(deviceType)) {
      commandAssistState.selectedPlatform = deviceType;
      commandAssistState.selectedPlatformAction = null;
      commandAssistState.history.push("platform-selection");
      commandAssistState.step = "platform-action";
      renderPlatformActionSelection(container);
      speakCommandMessage(`Selected ${option.label}. Now choose what you need to do.`);
    } else {
      // Network device - go to vendor selection
      commandAssistState.selectedPlatform = deviceType;
      commandAssistState.selectedVendor = null;
      commandAssistState.selectedVendorAction = null;
      commandAssistState.selectedVendorCategoryLabel = null;
      commandAssistState.history.push("platform-selection");
      commandAssistState.step = "vendor-selection";
      renderVendorSelection(container);
      speakCommandMessage(`Selected ${option.label} device. Now choose a vendor.`);
    }
  });

  container.appendChild(optionGrid);

  // Footer (no back on first screen)
  const footer = createFooterControls({
    showBack: false,
    showStopSpeech: true,
    onStopSpeech: stopAllSpeechForCommand,
  });
  container.appendChild(footer);

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";
}

/**
 * Render platform-specific action selection
 */
export function renderPlatformActionSelection(container) {
  if (!container || !commandAssistState.selectedPlatform) return;

  const platform = getPlatform(commandAssistState.selectedPlatform);
  if (!platform) return;

  container.innerHTML = "";

  // Prompt
  const prompt = createPromptPanel(
    `${platform.name} Commands`,
    `What do you need to do on ${platform.name}?`,
    `Choose a category or enter a command topic.`
  );
  container.appendChild(prompt);

  // Category options
  const categories = getPlatformCategories(commandAssistState.selectedPlatform);
  const categoryOptions = categories.map((cat) => ({
    label: cat.title,
    value: cat.title,
    icon: "📋",
  }));

  const optionGrid = createOptionGrid(categoryOptions, (option) => {
    commandAssistState.selectedPlatformAction = option.label;
    commandAssistState.history.push("platform-action");
    commandAssistState.step = "result";
    renderPlatformResult(container);
    speakCommandMessage(`Showing ${option.label} for ${platform.name}.`);
  });

  container.appendChild(optionGrid);

  // Free text input for custom commands
  const inputSection = document.createElement("div");
  inputSection.className = "input-section";
  inputSection.innerHTML = `
    <label for="commandInput" class="input-label">Or enter a command topic:</label>
    <div style="display: flex; gap: 8px;">
      <input type="text" id="commandInput" class="command-input" placeholder="e.g., 'show network config'" />
      <button type="button" class="chip input-submit-btn">Search</button>
    </div>
  `;
  container.appendChild(inputSection);

  const inputBtn = inputSection.querySelector(".input-submit-btn");
  const inputField = inputSection.querySelector("#commandInput");

  inputBtn.addEventListener("click", () => {
    const query = inputField.value.trim();
    if (query) {
      commandAssistState.selectedPlatformAction = query;
      commandAssistState.history.push("platform-action");
      commandAssistState.step = "result";
      renderPlatformResult(container);
      speakCommandMessage(`Searching for commands about ${query}.`);
    }
  });

  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      inputBtn.click();
    }
  });

  // Footer with back
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      commandAssistState.step = "platform-selection";
      commandAssistState.selectedPlatform = null;
      commandAssistState.history.pop();
      renderPlatformSelection(container);
      speakCommandMessage("Back to platform selection.");
    },
    onStopSpeech: stopAllSpeechForCommand,
  });
  container.appendChild(footer);

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";
}

/**
 * Render vendor selection
 */
export function renderVendorSelection(container) {
  if (!container) return;

  container.innerHTML = "";

  const deviceType = commandAssistState.selectedPlatform;
  const deviceLabel =
    deviceType === "firewall-vendor"
      ? "Firewall"
      : deviceType === "router-vendor"
        ? "Router"
        : "Switch";

  // Prompt
  const prompt = createPromptPanel(
    `${deviceLabel} Vendors`,
    `Which vendor is your ${deviceLabel}?`,
    `Select from common vendors or choose 'Other'.`
  );
  container.appendChild(prompt);

  // Vendor options
  const vendorOptions = [
    { label: "Cisco", value: "cisco", icon: "🔌" },
    { label: "Fortinet", value: "fortinet", icon: "🛡️" },
    { label: "Palo Alto", value: "palo-alto", icon: "🔴" },
    { label: "Juniper", value: "juniper", icon: "🌳" },
    { label: "Check Point", value: "checkpoint", icon: "✓" },
    { label: "Sophos", value: "sophos", icon: "🔒" },
    { label: "MikroTik", value: "mikrotik", icon: "M" },
    { label: "Ubiquiti", value: "ubiquiti", icon: "U" },
    { label: "Other", value: "other", icon: "?" },
  ];

  const optionGrid = createOptionGrid(vendorOptions, (option) => {
    commandAssistState.selectedVendor = option.value;
    commandAssistState.selectedVendorAction = null;
    commandAssistState.selectedVendorCategoryLabel = null;
    commandAssistState.history.push("vendor-selection");
    
    // Special handling for Cisco: show category exploration first
    if (option.value === "cisco") {
      commandAssistState.step = "cisco-category";
      renderCiscoCategorySelection(container);
      speakCommandMessage(`Selected ${option.label}. What would you like to explore?`);
    } else {
      commandAssistState.step = "vendor-action";
      renderVendorActionSelection(container);
      speakCommandMessage(`Selected ${option.label}. Now choose an action.`);
    }
  });

  container.appendChild(optionGrid);

  // Footer with back
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      commandAssistState.step = "platform-selection";
      commandAssistState.selectedPlatform = null;
      commandAssistState.history.pop();
      renderPlatformSelection(container);
      speakCommandMessage("Back to platform selection.");
    },
    onStopSpeech: stopAllSpeechForCommand,
  });
  container.appendChild(footer);

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";
}

/**
 * Render vendor-specific action selection
 */
export function renderVendorActionSelection(container) {
  if (!container || !commandAssistState.selectedVendor) return;

  const vendor = getVendor(commandAssistState.selectedVendor);
  if (!vendor) return;

  container.innerHTML = "";

  // Prompt
  const prompt = createPromptPanel(
    `${vendor.name} Actions`,
    `What do you want to do on a ${vendor.name} device?`,
    `Select from available actions or enter a custom query.`
  );
  container.appendChild(prompt);

  // Action options with enhanced grid
  const actions = getVendorActions(commandAssistState.selectedVendor);
  const actionOptions = actions.map((action) => ({
    label: action.label,
    value: action.label,
    icon: "⚙️",
    description: action.description || "Select this action",
  }));

  const optionGrid = createEnhancedOptionGrid(actionOptions, (option) => {
    commandAssistState.selectedVendorAction = option.value;
    commandAssistState.history.push("vendor-action");
    commandAssistState.step = "result";
    renderVendorResult(container);
    speakCommandMessage(`Showing command for ${option.label}.`);
  });

  container.appendChild(optionGrid);

  // Free text input
  const inputSection = document.createElement("div");
  inputSection.className = "input-section";
  inputSection.innerHTML = `
    <label for="vendorCommandInput" class="input-label">Or enter what you want to do:</label>
    <div style="display: flex; gap: 8px;">
      <input type="text" id="vendorCommandInput" class="command-input" placeholder="e.g., 'configure interface'" />
      <button type="button" class="chip input-submit-btn">Search</button>
    </div>
  `;
  container.appendChild(inputSection);

  const inputBtn = inputSection.querySelector(".input-submit-btn");
  const inputField = inputSection.querySelector("#vendorCommandInput");

  inputBtn.addEventListener("click", () => {
    const query = inputField.value.trim();
    if (query) {
      commandAssistState.selectedVendorAction = query;
      commandAssistState.history.push("vendor-action");
      commandAssistState.step = "result";
      renderVendorResult(container);
      speakCommandMessage(`Searching for ${query} on ${vendor.name}.`);
    }
  });

  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      inputBtn.click();
    }
  });

  // Footer with back
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      commandAssistState.step = "vendor-selection";
      commandAssistState.selectedVendor = null;
      commandAssistState.history.pop();
      renderVendorSelection(container);
      speakCommandMessage("Back to vendor selection.");
    },
    onStopSpeech: stopAllSpeechForCommand,
  });
  container.appendChild(footer);

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";
}

/**
 * Render Cisco category exploration screen
 * Ask user what aspect of Cisco they want to learn
 */
export function renderCiscoCategorySelection(container) {
  if (!container) return;

  const vendor = getVendor("cisco");
  if (!vendor || !vendor.categories) return;

  container.innerHTML = "";

  // Prompt
  const prompt = createPromptPanel(
    "Cisco - Advanced Enterprise Networking",
    "What aspect of Cisco would you like to explore?",
    "Each category includes production-grade commands with advanced alternatives and best practices."
  );
  container.appendChild(prompt);

  // Category options from Cisco registry with enhanced grid
  const categories = Object.entries(vendor.categories).map(([key, cat]) => ({
    label: cat.title,
    value: key,
    icon: "📚",
    description: cat.command,
  }));

  const optionGrid = createEnhancedOptionGrid(categories, (option) => {
    commandAssistState.selectedVendorAction = option.value;
    commandAssistState.selectedVendorCategoryLabel = option.label;
    commandAssistState.history.push("cisco-category");
    commandAssistState.step = "cisco-actions";
    renderCiscoActionsForCategory(container, option.value);
    speakCommandMessage(`Exploring ${option.label}. Here are the advanced commands.`);
  });

  container.appendChild(optionGrid);

  // Footer with back
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      commandAssistState.step = "vendor-selection";
      commandAssistState.selectedVendor = null;
      commandAssistState.selectedVendorAction = null;
      commandAssistState.selectedVendorCategoryLabel = null;
      commandAssistState.history.pop();
      renderVendorSelection(container);
      speakCommandMessage("Back to vendor selection.");
    },
    onStopSpeech: stopAllSpeechForCommand,
  });
  container.appendChild(footer);

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";
}

/**
 * Render Cisco actions for selected category
 * Shows all advanced commands in the category
 */
export function renderCiscoActionsForCategory(container, categoryKey) {
  if (!container) return;

  const vendor = getVendor("cisco");
  if (!vendor || !vendor.categories || !vendor.categories[categoryKey]) return;

  const category = vendor.categories[categoryKey];
  commandAssistState.selectedVendorAction = categoryKey;
  commandAssistState.selectedVendorCategoryLabel = category.title;
  let categoryActions = Object.entries(vendor.actions).filter(
    ([, action]) => action.category === categoryKey
  );

  if (!categoryActions.length) {
    categoryActions = Object.entries(vendor.actions).filter(([key]) => {
      const actionLower = key.toLowerCase();
      const categoryToken = categoryKey.split("_")[0];
      return actionLower.includes(categoryToken);
    });
  }

  categoryActions = categoryActions.slice(0, 8);

  container.innerHTML = "";

  // Prompt
  const prompt = createPromptPanel(
    category.title,
    "Select a command to explore advanced alternatives and best practices",
    category.command
  );
  container.appendChild(prompt);

  // Action options for this category with enhanced grid
  const actionOptions = categoryActions.length > 0 
    ? categoryActions.map(([key, action]) => ({
        label: key,
        value: key,
        icon: "⚡",
        description: action.description || "Advanced command alternative",
      }))
    : // Fallback: show all Cisco actions if filtering didn't work
      Object.keys(vendor.actions).slice(0, 8).map((key) => ({
        label: key,
        value: key,
        icon: "⚡",
        description: "Cisco command option",
      }));

  if (actionOptions.length > 0) {
    const optionGrid = createEnhancedOptionGrid(actionOptions, (option) => {
      const action = vendor.actions[option.value];
      if (!action) return;

      commandAssistState.commandResult = {
        title: option.label,
        ...action,
      };
      commandAssistState.history.push("cisco-action-selected");
      commandAssistState.step = "cisco-result";
      renderCiscoCommandResult(container);
      speakCommandMessage(`Showing ${option.label} with advanced alternatives.`);
    });

    container.appendChild(optionGrid);
  }

  // Footer with back
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      commandAssistState.step = "cisco-category";
      commandAssistState.selectedVendorAction = null;
      commandAssistState.selectedVendorCategoryLabel = null;
      commandAssistState.history.pop();
      renderCiscoCategorySelection(container);
      speakCommandMessage(`Back to ${category.title}.`);
    },
    onStopSpeech: stopAllSpeechForCommand,
  });
  container.appendChild(footer);

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";
}

/**
 * Render detailed Cisco command result
 * Shows command with explanation, advanced alternatives, warnings, and best practices
 */
export function renderCiscoCommandResult(container) {
  if (!container || !commandAssistState.commandResult) return;

  container.innerHTML = "";

  const result = commandAssistState.commandResult;

  // Title
  const titleSection = document.createElement("div");
  titleSection.style.cssText = `
    padding: 16px;
    background: var(--panel);
    border-left: 4px solid var(--accent);
    border-radius: 4px;
  `;
  titleSection.innerHTML = `
    <h3 style="margin: 0 0 8px 0; color: var(--accent); font-size: 18px;">${result.title}</h3>
    <p style="margin: 0; color: var(--muted); font-size: 14px;">Advanced Enterprise Command</p>
  `;
  container.appendChild(titleSection);

  // Main command card
  const resultCard = createCommandResultCard({
    command: result.command,
    explanation: result.explanation,
    warning: result.warning,
    example: result.example,
    advanced: result.advanced,
  });
  container.appendChild(resultCard);

  // Additional context section
  if (result.advanced) {
    const advancedSection = document.createElement("div");
    advancedSection.style.cssText = `
      padding: 14px;
      background: var(--panel);
      border-radius: 4px;
      border-left: 4px solid #ffa500;
    `;
    advancedSection.innerHTML = `
      <h4 style="margin: 0 0 8px 0; color: #ffa500; font-size: 15px;">⚡ Advanced Alternatives</h4>
      <p style="margin: 0; color: var(--muted); font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${result.advanced}</p>
    `;
    container.appendChild(advancedSection);
  }

  // Continue options
  const continueSection = document.createElement("div");
  continueSection.style.cssText = `
    padding: 14px;
    background: var(--panel);
    border-radius: 4px;
  `;
  continueSection.innerHTML = `<p style="margin: 0; color: var(--muted); font-size: 14px;">What's next?</p>`;
  
  const continueOptions = [
    { label: "Explore another command", value: "another" },
    { label: "Back to category", value: "category" },
    { label: "Choose different category", value: "restart" },
  ];

  const continueGrid = createOptionGrid(continueOptions, (option) => {
    if (option.value === "another") {
      commandAssistState.commandResult = null;
      commandAssistState.history.pop();
      const categoryKey = commandAssistState.selectedVendorAction || "device_management";
      renderCiscoActionsForCategory(container, categoryKey);
      speakCommandMessage("Here are more commands in this category.");
    } else if (option.value === "category") {
      commandAssistState.step = "cisco-category";
      commandAssistState.commandResult = null;
      commandAssistState.history.pop();
      renderCiscoCategorySelection(container);
      speakCommandMessage("Back to category selection.");
    } else {
      initCommandAssist();
      renderPlatformSelection(container);
      speakCommandMessage("Back to platform selection.");
    }
  });

  continueSection.appendChild(continueGrid);
  container.appendChild(continueSection);

  // Footer with stop speech only (back handled in continue options)
  const footer = createFooterControls({
    showBack: false,
    showStopSpeech: true,
    onStopSpeech: stopAllSpeechForCommand,
  });
  container.appendChild(footer);

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";
}

/**
 * Render platform command result
 */
export function renderPlatformResult(container) {
  if (!container || !commandAssistState.selectedPlatform || !commandAssistState.selectedPlatformAction)
    return;

  container.innerHTML = "";

  const platform = getPlatform(commandAssistState.selectedPlatform);
  const actionName = commandAssistState.selectedPlatformAction;

  // Find matching category
  const categories = getPlatformCategories(commandAssistState.selectedPlatform);
  let category = categories.find((c) => c.title === actionName);

  let resultContent = null;

  if (category && category.suggestions && category.suggestions.length) {
    // Show first suggestion as main result
    const suggestion = category.suggestions[0];
    resultContent = {
      command: suggestion.command,
      explanation: `This is a ${actionName} command for ${platform.name}.`,
      variations: category.suggestions.slice(1).map((s) => `${s.label}: ${s.command}`),
      troubleshooting: [
        "Command may vary by Windows/Server version",
        "Some commands require administrator privileges",
        "Check Get-Help for detailed parameter options",
      ],
    };
  } else {
    // Generic result for custom input
    resultContent = {
      command: `# Command for: ${actionName}`,
      explanation: `Please refer to ${platform.name} documentation for specific commands related to: ${actionName}`,
      troubleshooting: [
        "Use 'Get-Help CommandName' for details",
        "Check Microsoft documentation for full syntax",
        "Admin privileges may be required",
      ],
    };
  }

  // Show result
  const resultCard = createCommandResultCard(resultContent);
  container.appendChild(resultCard);

  // Prompt for next action
  const prompt = createPromptPanel(
    "Need another command?",
    `Pick another option below or try a different platform.`
  );
  container.appendChild(prompt);

  // Options to continue
  const continueOptions = [
    { label: "Try another action", value: "another-action", icon: "🔄" },
    { label: "Change platform", value: "change-platform", icon: "🔀" },
    { label: "Start over", value: "restart", icon: "🔄" },
  ];

  const optionGrid = createOptionGrid(continueOptions, (option) => {
    if (option.value === "another-action") {
      commandAssistState.step = "platform-action";
      commandAssistState.selectedPlatformAction = null;
      commandAssistState.history.pop();
      renderPlatformActionSelection(container);
      speakCommandMessage("Let's find another command.");
    } else if (option.value === "change-platform") {
      initCommandAssist();
      renderPlatformSelection(container);
      speakCommandMessage("Choose a new platform.");
    } else if (option.value === "restart") {
      initCommandAssist();
      renderPlatformSelection(container);
      speakCommandMessage("Starting over.");
    }
  });

  container.appendChild(optionGrid);

  // Footer
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      commandAssistState.step = "platform-action";
      commandAssistState.selectedPlatformAction = null;
      commandAssistState.history.pop();
      renderPlatformActionSelection(container);
      speakCommandMessage("Back to action selection.");
    },
    onStopSpeech: stopAllSpeechForCommand,
  });
  container.appendChild(footer);

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";
}

/**
 * Render vendor command result
 */
export function renderVendorResult(container) {
  if (!container || !commandAssistState.selectedVendor || !commandAssistState.selectedVendorAction)
    return;

  container.innerHTML = "";

  const vendor = getVendor(commandAssistState.selectedVendor);
  const actionName = commandAssistState.selectedVendorAction;

  let resultContent = null;

  if (vendor && vendor.actions && vendor.actions[actionName]) {
    const action = vendor.actions[actionName];
    resultContent = {
      command: action.command,
      explanation: action.explanation,
      warning: action.warning,
      example: action.example,
      troubleshooting: [
        `Confirm syntax for ${vendor.name} model you're using`,
        "Consult vendor documentation for variations",
        "Backup config before making changes",
      ],
    };
  } else {
    resultContent = {
      command: `# ${actionName}`,
      explanation: `Command syntax for: ${actionName} on ${vendor.name}`,
      troubleshooting: [
        `Check ${vendor.name} documentation for exact syntax`,
        "Device models may have variations",
        "Always backup before configuration changes",
      ],
    };
  }

  // Show result
  const resultCard = createCommandResultCard(resultContent);
  container.appendChild(resultCard);

  // Prompt for next action
  const prompt = createPromptPanel(
    "Pick another option.",
    `Continue exploring or start a new query.`
  );
  container.appendChild(prompt);

  // Options to continue
  const continueOptions = [
    { label: "Try another action", value: "another-action", icon: "🔄" },
    { label: "Change vendor", value: "change-vendor", icon: "🔀" },
    { label: "Start over", value: "restart", icon: "🔄" },
  ];

  const optionGrid = createOptionGrid(continueOptions, (option) => {
    if (option.value === "another-action") {
      commandAssistState.step = "vendor-action";
      commandAssistState.selectedVendorAction = null;
      commandAssistState.selectedVendorCategoryLabel = null;
      commandAssistState.history.pop();
      renderVendorActionSelection(container);
      speakCommandMessage("Let's find another action.");
    } else if (option.value === "change-vendor") {
      commandAssistState.step = "vendor-selection";
      commandAssistState.selectedVendor = null;
      commandAssistState.selectedVendorAction = null;
      commandAssistState.selectedVendorCategoryLabel = null;
      commandAssistState.history.pop();
      renderVendorSelection(container);
      speakCommandMessage("Choose a new vendor.");
    } else if (option.value === "restart") {
      initCommandAssist();
      renderPlatformSelection(container);
      speakCommandMessage("Starting over.");
    }
  });

  container.appendChild(optionGrid);

  // Footer
  const footer = createFooterControls({
    showBack: true,
    showStopSpeech: true,
    onBack: () => {
      commandAssistState.step = "vendor-action";
      commandAssistState.selectedVendorAction = null;
      commandAssistState.selectedVendorCategoryLabel = null;
      commandAssistState.history.pop();
      renderVendorActionSelection(container);
      speakCommandMessage("Back to action selection.");
    },
    onStopSpeech: stopAllSpeechForCommand,
  });
  container.appendChild(footer);

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "20px";
}

/**
 * Main render function
 */
export function renderCommandAssist(container) {
  if (!container) return;

  // Display tool context at the top
  updateToolContextDisplay("commands", container);

  switch (commandAssistState.step) {
    case "platform-selection":
      renderPlatformSelection(container);
      break;
    case "platform-action":
      renderPlatformActionSelection(container);
      break;
    case "vendor-selection":
      renderVendorSelection(container);
      break;
    case "vendor-action":
      renderVendorActionSelection(container);
      break;
    case "cisco-category":
      renderCiscoCategorySelection(container);
      break;
    case "cisco-actions":
      renderCiscoActionsForCategory(container, commandAssistState.selectedVendorAction?.toLowerCase().replace(/\s+/g, "_") || "device_management");
      break;
    case "cisco-result":
      renderCiscoCommandResult(container);
      break;
    case "result":
      // Results are rendered directly in the action handlers
      break;
  }
}

/**
 * Handle speech
 */
let commandSpeechUtterance = null;

export function speakCommandMessage(text) {
  const ENABLE_COMMAND_TTS = false;
  if (!ENABLE_COMMAND_TTS) return;
  if (!text || !("speechSynthesis" in window)) return;

  // Check global mute flag
  if (window.isSpeechMuted) return;

  if (commandSpeechUtterance) {
    window.speechSynthesis.cancel();
  }

  commandSpeechUtterance = new SpeechSynthesisUtterance(text);
  commandSpeechUtterance.rate = 1;
  window.speechSynthesis.speak(commandSpeechUtterance);
}

export function stopAllSpeechForCommand() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  commandSpeechUtterance = null;
}

/**
 * Get current state for debugging
 */
export function getCommandAssistState() {
  return { ...commandAssistState };
}

/**
 * Reset state
 */
export function resetCommandAssist() {
  initCommandAssist();
}

/**
 * Clear Command Assist state and re-render to landing state
 */
export function clearCommandAssist() {
  initCommandAssist();
  const container = document.getElementById("cipherDeepBody");
  if (container) {
    renderCommandAssist(container);
  }
}
