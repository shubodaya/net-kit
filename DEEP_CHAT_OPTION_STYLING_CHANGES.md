# Deep Chat Tool Options - Exact Code Changes

## File 1: styles.css

### Change 1.1: Added CSS Variables (in `:root` section)

**Location**: After existing variables (around line 10)

**Before**:
```css
:root {
  color-scheme: dark;
  --bg: #02140b;
  --panel: #041f12;
  --ink: #b7ffc2;
  --muted: #6fbc7b;
  --accent: #2cff67;
  --accent-2: #19b74f;
  --edge: #0f4a2b;
  --shadow: 0 18px 40px rgba(0, 255, 102, 0.12);
}
```

**After**:
```css
:root {
  color-scheme: dark;
  --bg: #02140b;
  --panel: #041f12;
  --ink: #b7ffc2;
  --muted: #6fbc7b;
  --accent: #2cff67;
  --accent-2: #19b74f;
  --edge: #0f4a2b;
  --shadow: 0 18px 40px rgba(0, 255, 102, 0.12);

  /* Tool option button theming - for non-Command Assist tools */
  --option-button-text: var(--ink);
  --option-button-text-hover: white;
  --option-button-text-active: white;
  --option-button-text-selected: white;

  /* Contrast enhancement for white text states */
  --option-button-hover-bg: #1a4d3e;
  --option-button-active-bg: #0d3a2d;
  --option-button-selected-bg: rgba(44, 255, 103, 0.2);
}
```

---

### Change 1.2: Updated .option-button Styles

**Location**: Around line 2620

**Before**:
```css
.option-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  min-height: 44px;
  min-width: 120px;
  font-size: 0.9em;
  white-space: normal;
  word-break: break-word;
  transition: all 0.2s ease;
}

.option-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 255, 103, 0.15);
}

.option-button:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.option-button:active {
  transform: translateY(0);
}
```

**After**:
```css
.option-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  min-height: 44px;
  min-width: 120px;
  font-size: 0.9em;
  white-space: normal;
  word-break: break-word;
  transition: all 0.2s ease;
  color: var(--option-button-text);
  background: var(--panel);
  border: 1px solid var(--edge);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

/* Non-Command Assist tool option buttons - white text with improved contrast */
.option-button[data-tool-type="non-command-assist"] {
  color: white;
}

.option-button[data-tool-type="non-command-assist"]:hover {
  background: var(--option-button-hover-bg);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 255, 103, 0.25);
  border-color: var(--accent);
}

.option-button[data-tool-type="non-command-assist"]:active {
  background: var(--option-button-active-bg);
  color: white;
  transform: translateY(0);
  border-color: var(--accent);
}

.option-button[data-tool-type="non-command-assist"].active,
.option-button[data-tool-type="non-command-assist"].selected {
  background: var(--option-button-selected-bg);
  color: white;
  border-color: var(--accent);
  box-shadow: 0 0 12px rgba(44, 255, 103, 0.3);
}

/* Command Assist tool option buttons - keep original green text */
.option-button[data-tool-type="command-assist"] {
  color: var(--accent);
}

.option-button[data-tool-type="command-assist"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 255, 103, 0.15);
}

/* Default behavior for buttons without tool type specified */
.option-button:not([data-tool-type]) {
  color: white;
}

.option-button:not([data-tool-type]):hover {
  background: var(--option-button-hover-bg);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 255, 103, 0.25);
  border-color: var(--accent);
}

.option-button:not([data-tool-type]):active {
  background: var(--option-button-active-bg);
  color: white;
  transform: translateY(0);
  border-color: var(--accent);
}

.option-button:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

### Change 1.3: Updated .enhanced-option-label Styles

**Location**: Around line 2869

**Before**:
```css
.enhanced-option-label {
  font-weight: 600;
  color: var(--accent);
  font-size: 13px;
  line-height: 1.3;
  word-break: break-word;
}
```

**After**:
```css
.enhanced-option-label {
  font-weight: 600;
  color: var(--accent);
  font-size: 13px;
  line-height: 1.3;
  word-break: break-word;
}

/* Enhanced option card labels for non-Command Assist tools */
.enhanced-option-card[data-tool-type="non-command-assist"] .enhanced-option-label {
  color: white;
}

/* Enhanced option card hover/selected states for non-Command Assist tools */
.enhanced-option-card[data-tool-type="non-command-assist"]:hover .enhanced-option-label,
.enhanced-option-card[data-tool-type="non-command-assist"].selected .enhanced-option-label {
  color: white;
}
```

---

## File 2: components/options_panel.js

### Change 2.1: Updated Category Button Creation

**Location**: Around line 120 in `renderCategorySelection()` function

**Before**:
```javascript
  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.className = "option-button";
    btn.style.cssText = `
      padding: 12px;
      background: var(--panel, #f5f5f5);
      border: 1px solid var(--edge, #ddd);
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      color: var(--text, #000);
    `;

    btn.innerHTML = `<div style="text-align: center;">${category.label}</div>`;

    btn.addEventListener("mouseover", function () {
      this.style.background = "var(--accent, #007bff)";
      this.style.color = "white";
      this.style.borderColor = "var(--accent, #007bff)";
    });

    btn.addEventListener("mouseout", function () {
      this.style.background = "var(--panel, #f5f5f5)";
      this.style.color = "var(--text, #000)";
      this.style.borderColor = "var(--edge, #ddd)";
    });

    btn.addEventListener("click", function () {
      optionsPanelState.selectedCategory = category.id;
      optionsPanelState.screen = "options";
      renderOptionSelection(container, toolId, category.id, onSelectOption, onBack);
    });

    gridDiv.appendChild(btn);
  });
```

**After**:
```javascript
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
```

**Changes Made**:
- Removed inline `style.cssText` (now uses CSS classes)
- Removed mouseover/mouseout event listeners (now uses CSS :hover)
- Added `data-tool-type` attribute based on toolId
- Simplified code by ~15 lines

---

### Change 2.2: Updated Option Button Creation

**Location**: Around line 220 in `renderOptionSelection()` function

**Before**:
```javascript
  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option-list-item";
    btn.style.cssText = `
      padding: 12px;
      background: var(--panel, #f5f5f5);
      border: 1px solid var(--edge, #ddd);
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
      color: var(--text, #000);
    `;

    btn.innerHTML = `
      <div style="font-weight: 600; font-size: 14px;">${option.label}</div>
      <div style="font-size: 12px; color: var(--muted, #999); margin-top: 4px;">${option.example || ""}</div>
    `;

    btn.addEventListener("mouseover", function () {
      this.style.background = "var(--accent, #007bff)";
      this.style.color = "white";
      this.style.borderColor = "var(--accent, #007bff)";
    });

    btn.addEventListener("mouseout", function () {
      this.style.background = "var(--panel, #f5f5f5)";
      this.style.color = "var(--text, #000)";
      this.style.borderColor = "var(--edge, #ddd)";
    });

    btn.addEventListener("click", function () {
      // Call the callback with template and metadata
      onSelectOption({
        toolId,
        categoryId,
        optionId: option.id,
        label: option.label,
        template: option.template,
      });
    });

    gridDiv.appendChild(btn);
  });
```

**After**:
```javascript
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
      });
    });

    gridDiv.appendChild(btn);
  });
```

**Changes Made**:
- Changed class from `"option-list-item"` to `"option-button"` (uses CSS class styling)
- Removed inline `style.cssText` (now uses CSS classes)
- Removed mouseover/mouseout event listeners (now uses CSS :hover)
- Added `data-tool-type` attribute based on toolId
- Simplified code by ~20 lines

---

## File 3: components/ui_components.js

### Change 3.1: Updated createOptionGrid Function

**Location**: Around line 65

**Before**:
```javascript
export function createOptionGrid(options, onSelect, containerClass = "") {
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
    
    // ... rest of function unchanged
  });

  return container;
}
```

**After**:
```javascript
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
    
    // ... rest of function unchanged
  });

  return container;
}
```

**Changes Made**:
- Added `toolType = "command-assist"` parameter (optional, defaults to "command-assist")
- Added `button.setAttribute("data-tool-type", toolType)` line
- Backward compatible (existing calls work without modification)

---

### Change 3.2: Updated createEnhancedOptionGrid Function

**Location**: Around line 389

**Before**:
```javascript
/**
 * Create enhanced option card grid with better clarity and visuals
 * Used for Command Assist and tools to improve discoverability
 * @param {Array<{label: string, value: string, icon?: string, description?: string}>} options
 * @param {Function} onSelect - Callback when option selected
 * @returns {HTMLElement} Container with card-style options
 */
export function createEnhancedOptionGrid(options, onSelect) {
  const container = document.createElement("div");
  container.className = "enhanced-option-grid";

  options.forEach((option) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "enhanced-option-card";
    card.setAttribute("aria-label", option.label);
    
    // ... rest of function unchanged
  });

  return container;
}
```

**After**:
```javascript
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
    
    // ... rest of function unchanged
  });

  return container;
}
```

**Changes Made**:
- Added `toolType = "command-assist"` parameter (optional, defaults to "command-assist")
- Added `card.setAttribute("data-tool-type", toolType)` line
- Updated JSDoc to document new parameter
- Backward compatible (existing calls work without modification)

---

## Summary of Changes

| File | Lines Changed | Type | Impact |
|------|--------------|------|--------|
| styles.css | ~50 | CSS | Theme variables + new selectors |
| options_panel.js | ~30 | JavaScript | Add data-tool-type attribute |
| ui_components.js | ~4 | JavaScript | Add optional parameter + attribute |
| **Total** | **~84** | Mixed | White text for non-Command Assist tools |

---

## How to Apply Changes

### Option 1: Copy-Paste Directly
1. Open each file in editor
2. Find the "Before" code section
3. Replace with "After" code section
4. Save file

### Option 2: Use Git Patch
If using version control:
```bash
git apply changes.patch
```

### Option 3: Manual Line-by-Line
1. styles.css: Add CSS variables (10 lines) + update .option-button (60+ lines)
2. options_panel.js: Replace 2 forEach blocks (~30 lines each)
3. ui_components.js: Add 2 lines per function (4 lines total)

---

## Verification Checklist

After applying changes:

- [ ] styles.css contains new CSS variables in `:root`
- [ ] styles.css has new `.option-button[data-tool-type="..."]` selectors
- [ ] options_panel.js sets `data-tool-type` attribute on buttons
- [ ] ui_components.js functions accept `toolType` parameter
- [ ] No syntax errors (run linter if available)
- [ ] Application loads without errors
- [ ] Incident Triage options show WHITE text
- [ ] Command Assist options show GREEN text
- [ ] Hover states work correctly

---

## Rollback Instructions

If you need to undo changes:

1. **styles.css**: Remove the new CSS rules and variables (added after line 10 and after line 2620)
2. **options_panel.js**: Restore original mouseover/mouseout event listeners and inline styles
3. **ui_components.js**: Remove `toolType` parameters and `setAttribute()` calls

Or use version control:
```bash
git checkout -- styles.css components/options_panel.js components/ui_components.js
```
