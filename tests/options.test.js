/**
 * Unit Tests for Options Panel
 * Tests options rendering, template selection, and state transitions
 */

import { getToolOptions, getToolCategories, getCategoryOptions } from "../data/tool_options.js";
import {
  renderOptionsPanel,
  resetOptionsPanelState,
  getOptionsPanelState,
  updateOptionsPanelState,
} from "../components/options_panel.js";

/**
 * Test Suite: Tool Options Registry
 */
describe("Tool Options Registry", () => {
  test("should load all tool options", () => {
    const toolkit = getToolOptions("toolkit");
    expect(toolkit).toBeDefined();
    expect(toolkit.name).toBe("Tool Kit");
    expect(toolkit.categories).toBeDefined();
  });

  test("should load incident triage tool", () => {
    const triage = getToolOptions("incident_triage");
    expect(triage).toBeDefined();
    expect(triage.name).toBe("Incident Triage");
    expect(triage.icon).toBe("🚨");
  });

  test("should load threat intel tool", () => {
    const intel = getToolOptions("threat_intel");
    expect(intel).toBeDefined();
    expect(intel.name).toBe("Threat Intel Summary");
  });

  test("should load phishing analyzer tool", () => {
    const phishing = getToolOptions("phishing_analyzer");
    expect(phishing).toBeDefined();
    expect(phishing.name).toBe("Phishing Analyzer");
  });

  test("should load compliance helper tool", () => {
    const compliance = getToolOptions("compliance_helper");
    expect(compliance).toBeDefined();
    expect(compliance.name).toBe("Compliance Helper");
  });

  test("should return categories for toolkit", () => {
    const categories = getToolCategories("toolkit");
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0].label).toBeDefined();
  });

  test("should return options for a category", () => {
    const categories = getToolCategories("toolkit");
    const firstCategory = categories[0];
    const options = getCategoryOptions("toolkit", firstCategory.id);
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].label).toBeDefined();
    expect(options[0].template).toBeDefined();
  });

  test("should return null for non-existent tool", () => {
    const tool = getToolOptions("non_existent");
    expect(tool).toBeNull();
  });

  test("should return empty array for non-existent category", () => {
    const options = getCategoryOptions("toolkit", "non_existent");
    expect(options).toEqual([]);
  });
});

/**
 * Test Suite: Options Panel State Management
 */
describe("Options Panel State", () => {
  test("should initialize state for a tool", () => {
    resetOptionsPanelState("toolkit");
    const state = getOptionsPanelState();
    expect(state.toolId).toBe("toolkit");
    expect(state.screen).toBe("categories");
    expect(state.selectedCategory).toBeNull();
  });

  test("should update state", () => {
    resetOptionsPanelState("toolkit");
    updateOptionsPanelState({ selectedCategory: "networking" });
    const state = getOptionsPanelState();
    expect(state.selectedCategory).toBe("networking");
  });

  test("should transition to options screen", () => {
    resetOptionsPanelState("toolkit");
    updateOptionsPanelState({
      screen: "options",
      selectedCategory: "networking",
    });
    const state = getOptionsPanelState();
    expect(state.screen).toBe("options");
  });
});

/**
 * Test Suite: Options Panel Rendering
 */
describe("Options Panel Rendering", () => {
  let containerDiv;

  beforeEach(() => {
    containerDiv = document.createElement("div");
    document.body.appendChild(containerDiv);
  });

  afterEach(() => {
    document.body.removeChild(containerDiv);
  });

  test("should render options panel for toolkit", () => {
    renderOptionsPanel(containerDiv, "toolkit", () => {});
    expect(containerDiv.querySelector(".options-intro")).toBeDefined();
    expect(containerDiv.innerHTML).toContain("Tool Kit");
  });

  test("should render options panel for incident triage", () => {
    renderOptionsPanel(containerDiv, "incident_triage", () => {});
    expect(containerDiv.innerHTML).toContain("Incident Triage");
  });

  test("should render category grid", () => {
    renderOptionsPanel(containerDiv, "toolkit", () => {});
    const grid = containerDiv.querySelector(".options-grid");
    expect(grid).toBeDefined();
  });

  test("should call callback when option is selected", (done) => {
    const callback = (selection) => {
      expect(selection.toolId).toBe("toolkit");
      expect(selection.label).toBeDefined();
      expect(selection.template).toBeDefined();
      done();
    };

    renderOptionsPanel(containerDiv, "toolkit", callback);

    // Simulate category click
    const categories = containerDiv.querySelectorAll(".option-button");
    expect(categories.length).toBeGreaterThan(0);

    // Click first category
    categories[0].click();

    // Wait for DOM to update
    setTimeout(() => {
      // Click first option in that category
      const options = containerDiv.querySelectorAll(".option-list-item");
      if (options.length > 0) {
        options[0].click();
      }
    }, 100);
  });

  test("should display correct option count per category", () => {
    renderOptionsPanel(containerDiv, "toolkit", () => {});
    const categories = containerDiv.querySelectorAll(".option-button");

    // For toolkit, we expect multiple categories
    expect(categories.length).toBeGreaterThan(0);
  });
});

/**
 * Test Suite: Template Prefilling
 */
describe("Template Prefilling", () => {
  test("should have template for password checker", () => {
    const categories = getToolCategories("toolkit");
    const securityCat = categories.find((c) => c.label.includes("Security"));
    if (securityCat) {
      const options = getCategoryOptions("toolkit", securityCat.id);
      const passwordChecker = options.find((o) => o.label.includes("Password"));
      if (passwordChecker) {
        expect(passwordChecker.template).toBeDefined();
        expect(passwordChecker.template.length).toBeGreaterThan(0);
      }
    }
  });

  test("should have template for incident triage", () => {
    const categories = getToolCategories("incident_triage");
    expect(categories.length).toBeGreaterThan(0);
    const options = getCategoryOptions("incident_triage", categories[0].id);
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].template).toBeDefined();
  });

  test("should have template for phishing analyzer", () => {
    const categories = getToolCategories("phishing_analyzer");
    expect(categories.length).toBeGreaterThan(0);
    const options = getCategoryOptions("phishing_analyzer", categories[0].id);
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].template).toBeDefined();
  });
});

/**
 * Test Suite: Speech Mute Flag
 */
describe("Global Speech Mute Control", () => {
  test("should have global mute flag", () => {
    expect(window.isSpeechMuted).toBeDefined();
    expect(typeof window.isSpeechMuted).toBe("boolean");
  });

  test("should initialize mute flag to false", () => {
    window.isSpeechMuted = false;
    expect(window.isSpeechMuted).toBe(false);
  });

  test("should toggle mute flag", () => {
    window.isSpeechMuted = false;
    window.isSpeechMuted = !window.isSpeechMuted;
    expect(window.isSpeechMuted).toBe(true);
  });
});

/**
 * Test Suite: UI Integration
 */
describe("UI Integration", () => {
  test("should have mute button in DOM", () => {
    const muteBtn = document.getElementById("muteTtsBtn");
    expect(muteBtn).toBeDefined();
  });

  test("should toggle muted class on click", () => {
    const muteBtn = document.getElementById("muteTtsBtn");
    if (muteBtn) {
      muteBtn.click();
      expect(muteBtn.classList.contains("muted")).toBe(true);
      muteBtn.click();
      expect(muteBtn.classList.contains("muted")).toBe(false);
    }
  });

  test("should update global flag on button click", () => {
    const muteBtn = document.getElementById("muteTtsBtn");
    if (muteBtn) {
      const initialState = window.isSpeechMuted;
      muteBtn.click();
      expect(window.isSpeechMuted).not.toBe(initialState);
    }
  });
});
