# Command Assist - Testing Checklist

## Overview
This checklist verifies that:
1. **Multi-line command rendering** - Commands display with proper line breaks and indentation
2. **Copy functionality** - Copied text preserves formatting with newlines and indentation
3. **Enhanced options UI** - Options display as visually distinct cards matching Toolkit clarity

---

## Part 1: Command Rendering & Formatting Tests

### Test 1.1: Boot System Command
**Command Type:** Boot configuration with register setting

**Steps:**
1. Open Command Assist
2. Select "Cisco" vendor
3. Navigate to "Device Management" category
4. Select "Boot System Configuration" action

**Expected Results:**
- [ ] Command displays in a code block with `<pre><code>` styling
- [ ] Command shows **2+ lines** with proper formatting (NOT single wrapped line)
- [ ] Line breaks are preserved between "boot system" and "config-register" commands
- [ ] Indentation is visible and consistent
- [ ] Background color is dark with green/accent color text
- [ ] Code block has visible border and padding

**Example Expected Display:**
```
boot system flash:c3750e-universalk9-mz.152-2.E10/
config-register 0x2102
```

---

### Test 1.2: Interface Range Configuration
**Command Type:** Interface configuration with multiple commands

**Steps:**
1. Select "Cisco" vendor
2. Navigate to "Interface Configuration" category
3. Select an interface range command (e.g., "Configure Interface Range")

**Expected Results:**
- [ ] Multi-line interface config displays with proper indentation
- [ ] Sub-commands (speed, duplex, no shutdown) show indented 2 spaces from parent
- [ ] All lines visible without text wrapping issues
- [ ] Syntax highlighting maintains color consistency

**Example Expected Display:**
```
interface range gigabitethernet 0/0-1
  speed 1000
  duplex full
  no shutdown
```

---

### Test 1.3: Router Configuration Mode
**Command Type:** Router mode with nested configuration

**Steps:**
1. Select "Cisco" vendor
2. Navigate to "Routing Configuration" category
3. Select a router BGP/OSPF command

**Expected Results:**
- [ ] Router mode commands display with proper hierarchy indentation
- [ ] Parent mode (e.g., "router bgp 65001") shows at column 0
- [ ] Nested commands (address-family, neighbor) indented by 2 spaces
- [ ] Deep nesting (e.g., address-family sub-commands) indented by 4 spaces
- [ ] All formatting preserved in display

---

### Test 1.4: Line VTY Hardening Command
**Command Type:** VTY security configuration with multiple settings

**Steps:**
1. Select "Cisco" vendor
2. Navigate to "Security Configuration" category
3. Select "VTY Hardening" or similar security command

**Expected Results:**
- [ ] "line vty" parent command at column 0
- [ ] Access control commands (transport input, logging) indented 2 spaces
- [ ] ACL references properly formatted
- [ ] No line wrapping within individual commands
- [ ] Complete command visible without horizontal scroll (if <80 chars)

---

### Test 1.5: IP Access List Configuration
**Command Type:** Extended access list with permit/deny rules

**Steps:**
1. Select "Cisco" vendor
2. Navigate to "Security Configuration" category
3. Select "IP Access List" command

**Expected Results:**
- [ ] Parent command "ip access-list extended ..." at column 0
- [ ] Individual permit/deny rules indented 2 spaces
- [ ] Long permit/deny lines break properly without corruption
- [ ] Protocol and port specifications visible
- [ ] Code block scrollable if necessary for very long lines

---

### Test 1.6: Cryptographic Configuration
**Command Type:** Crypto-related configuration (IPsec, VPN)

**Steps:**
1. Select "Cisco" vendor
2. Navigate to "VPN & Crypto" or "Advanced Security" category
3. Select a crypto command (e.g., IPsec profile)

**Expected Results:**
- [ ] Crypto policy commands display with proper nesting
- [ ] Transform-set, encryption algorithm commands properly indented
- [ ] Peer configuration details visible and formatted
- [ ] No loss of information due to formatting

---

## Part 2: Copy Button & Clipboard Tests

### Test 2.1: Copy Boot Command
**Steps:**
1. Display boot system command (Test 1.1)
2. Click "Copy to Clipboard" button
3. Open a text editor (Notepad/VS Code)
4. Paste the command

**Expected Results:**
- [ ] "Copied!" feedback message appears
- [ ] Pasted text includes **line breaks** between commands
- [ ] Pasted text includes **proper indentation** (2-space indent for sub-commands)
- [ ] Pasted text is cleanly formatted and ready to paste into device
- [ ] No extra spaces or formatting artifacts

**Verification:**
Pasted text should be:
```
boot system flash:c3750e-universalk9-mz.152-2.E10/
config-register 0x2102
```

---

### Test 2.2: Copy Interface Config
**Steps:**
1. Display interface range command (Test 1.2)
2. Click "Copy to Clipboard" button
3. Paste into text editor

**Expected Results:**
- [ ] Line breaks preserved between interface definition and sub-commands
- [ ] 2-space indentation for sub-commands preserved
- [ ] "no shutdown" and other commands appear on separate lines
- [ ] Formatted text ready for CLI paste

---

### Test 2.3: Copy Long VTY Config
**Steps:**
1. Display VTY hardening command (Test 1.4)
2. Click "Copy to Clipboard" button
3. Paste into text editor and verify

**Expected Results:**
- [ ] All transport, logging, and ACL commands copied with proper formatting
- [ ] Long lines properly preserved (no truncation)
- [ ] Indentation levels maintained for readability
- [ ] Can directly paste into device without modification

---

## Part 3: Enhanced Options UI Tests

### Test 3.1: Options Display as Cards
**Steps:**
1. Open Command Assist
2. Navigate to any vendor selection screen with multiple options

**Expected Results:**
- [ ] Options display as **card-style buttons**, not flat chips
- [ ] Each card has:
  - [ ] **Icon** (emoji) on the left side
  - [ ] **Label** (option name) in bold, accent color
  - [ ] **Description** text below label (smaller, muted color)
  - [ ] Visible padding inside each card
  - [ ] Clear border around each card
- [ ] Cards arranged in a responsive grid (multiple columns on wide screen)
- [ ] Consistent spacing between cards (12px gap)
- [ ] Card background distinct from main background

---

### Test 3.2: Card Hover State
**Steps:**
1. Display options in a grid (from Test 3.1)
2. Move mouse over a card without clicking

**Expected Results:**
- [ ] Card background changes (becomes lighter/more visible)
- [ ] Card border color changes to accent color (#2cff67)
- [ ] Card has a subtle glow/shadow effect
- [ ] Card slightly elevates (translateY -2px)
- [ ] Cursor changes to pointer
- [ ] Hover effect is smooth transition (0.2s)

---

### Test 3.3: Card Click & Selection State
**Steps:**
1. Display options in a grid
2. Click on a card to select it

**Expected Results:**
- [ ] Card background changes to a different color (rgba with accent)
- [ ] Card border becomes accent color
- [ ] Card has stronger shadow/glow effect (selected state)
- [ ] Option callback fires (advances to next screen/action)
- [ ] Visual feedback immediate upon click

---

### Test 3.4: Vendor Action Selection Screen
**Steps:**
1. Open Command Assist
2. Select any vendor (Cisco, Fortinet, etc.)
3. Look at the action selection screen

**Expected Results:**
- [ ] Actions display as enhanced cards with icons (⚙️)
- [ ] Each action shows:
  - [ ] Action name as label
  - [ ] Description from command registry (if available)
  - [ ] Ⓔ icon consistently positioned
- [ ] Cards are visually distinct from previous screens
- [ ] Hover and selection states work as expected (Test 3.2, 3.3)

---

### Test 3.5: Cisco Category Selection
**Steps:**
1. Open Command Assist
2. Select "Cisco" vendor
3. View the category selection screen

**Expected Results:**
- [ ] Categories display as cards with 📚 icon
- [ ] Each category card shows:
  - [ ] Category title as label (e.g., "Device Management")
  - [ ] Category command/description below label
  - [ ] Professional styling matching Toolkit
- [ ] Grid layout responsive to window size
- [ ] Cards have proper spacing and alignment
- [ ] All categories visible without needing to scroll horizontally

---

### Test 3.6: Options UI Clarity vs Toolkit
**Steps:**
1. Open the Toolkit tool in Deep Chat
2. Note the visual style of option cards (spacing, colors, typography)
3. Switch to Command Assist and navigate to options screen
4. Compare visual clarity and presentation

**Expected Results:**
- [ ] Command Assist options cards are **visually similar** to Toolkit cards
- [ ] Card spacing and sizing are comparable
- [ ] Typography (labels, descriptions) has similar hierarchy
- [ ] Color contrast is strong and readable
- [ ] Icons are clearly visible and appropriately sized
- [ ] Overall UI "feels" consistent between tools

---

## Part 4: Integration & Flow Tests

### Test 4.1: Full Command Discovery Flow
**Steps:**
1. Open Command Assist
2. Select "Cisco" vendor → see Cisco category selection (enhanced cards)
3. Select "Device Management" category → see action cards (enhanced)
4. Select "Boot System" action → see command with proper formatting
5. Click Copy → paste to verify formatting

**Expected Results:**
- [ ] Smooth flow through all steps
- [ ] Options display correctly at each step
- [ ] Command renders with proper multi-line formatting
- [ ] Copy functionality preserves all formatting
- [ ] No errors or console issues

---

### Test 4.2: Vendor Comparison Flow
**Steps:**
1. Open Command Assist
2. Select different vendors (Cisco, Fortinet, etc.)
3. Navigate through their actions at each level

**Expected Results:**
- [ ] Enhanced cards display consistently for all vendors
- [ ] Icons and descriptions are appropriate for each action type
- [ ] Command formatting applies uniformly to all multi-line commands
- [ ] Copy button works for all command types

---

### Test 4.3: Back Navigation
**Steps:**
1. Navigate through Command Assist: Vendor → Category → Action → Command
2. At command results screen, click "Back"
3. Verify you return to action selection
4. Click "Back" again to return to category selection

**Expected Results:**
- [ ] Navigation history works correctly
- [ ] Back button appears when needed
- [ ] Options re-render properly when returning to previous screens
- [ ] State management maintains proper context
- [ ] No duplicate cards or rendering issues

---

## Part 5: Edge Cases & Robustness

### Test 5.1: Very Long Command Names
**Steps:**
1. Find a vendor/action with a long name
2. View in options grid

**Expected Results:**
- [ ] Long labels wrap within card or truncate gracefully
- [ ] Card size adjusts to accommodate text
- [ ] Layout doesn't break or distort
- [ ] Text remains readable

---

### Test 5.2: Commands Without Descriptions
**Steps:**
1. Trigger command from action with no description field
2. Verify options display properly

**Expected Results:**
- [ ] Card displays with label even if description is missing
- [ ] No console errors
- [ ] Empty description field doesn't create spacing issues
- [ ] Card layout remains intact

---

### Test 5.3: Narrow Window Rendering
**Steps:**
1. Resize browser window to narrow width (300px wide)
2. View options grid and commands

**Expected Results:**
- [ ] Enhanced grid collapses to single-column layout responsively
- [ ] Commands remain readable with word-wrap
- [ ] Code blocks handle narrow widths with appropriate scroll
- [ ] Layout adjusts gracefully without breaking

---

### Test 5.4: Commands with Special Characters
**Steps:**
1. Find commands with special characters (!, @, #, $, %, &, etc.)
2. Display and copy command

**Expected Results:**
- [ ] Special characters display correctly in code block
- [ ] Copy button preserves all special characters
- [ ] Pasted text includes special characters unmodified
- [ ] No HTML encoding/escaping issues

---

## Part 6: Browser Console Verification

### Test 6.1: No Errors During Navigation
**Steps:**
1. Open browser Developer Tools (F12) → Console tab
2. Navigate through entire Command Assist flow
3. Display options, commands, copy buttons
4. Watch console for errors

**Expected Results:**
- [ ] **Zero errors** in console
- [ ] No warnings about undefined functions
- [ ] No issues with imports or dependencies
- [ ] No memory leaks indicated

---

### Test 6.2: Formatter Functions Loaded
**Steps:**
1. Open browser console
2. Type: `window.commandFormatterLoaded`
3. Verify command_formatter.js is accessible

**Expected Results:**
- [ ] No errors when accessing formatter
- [ ] Functions like `formatCiscoCommand()` are callable
- [ ] No issues with module imports

---

## Part 7: Accessibility & Usability

### Test 7.1: Card Keyboard Navigation
**Steps:**
1. Use Tab key to navigate between option cards
2. Press Enter on a focused card to select

**Expected Results:**
- [ ] Tab key properly focuses each card
- [ ] Focused card has visible focus indicator (outline)
- [ ] Enter key activates the selected card
- [ ] Space bar can also activate cards (if supported)

---

### Test 7.2: Text Selection & Readability
**Steps:**
1. Display command in code block
2. Try to select and copy text manually (not using copy button)

**Expected Results:**
- [ ] Code block text is selectable
- [ ] Formatting markers (newlines, indentation) are visible
- [ ] Manual selection/copy preserves structure
- [ ] High contrast makes text readable

---

## Manual Test Execution Steps

### Quick Smoke Test (5 minutes)
1. Open Command Assist
2. Select Cisco → Navigate to any category
3. View options (verify enhanced cards display)
4. Select an action to view command
5. Verify command shows multi-line with proper indentation
6. Click Copy and paste into text editor to verify formatting

### Full Test Suite (30 minutes)
1. Execute all tests in Parts 1-3 sequentially
2. Note any failures in format: `Test X.Y: [PASS/FAIL] - Details`
3. Screenshots recommended for visual tests (3.1-3.6)
4. Create issue if any test fails

### Focus Areas
- **Priority 1** (Critical): Tests 1.1-1.4 (command rendering)
- **Priority 2** (High): Tests 2.1-2.3 (copy functionality)
- **Priority 3** (High): Tests 3.1-3.5 (enhanced options UI)
- **Priority 4** (Medium): Tests 4.1-5.4 (integration & edge cases)
- **Priority 5** (Low): Tests 6.1-7.2 (robustness & accessibility)

---

## Known Limitations & Notes

1. **Command Registry**: Tests depend on commands being properly configured in `command_registry.js` with `\n` escape sequences
2. **Browser Support**: CSS `white-space: pre` supported in all modern browsers
3. **Emoji Support**: Card icons use emoji; verify font support on test device
4. **Window Width**: Enhanced grid responsive breakpoint at `minmax(180px, 1fr)`
5. **TTS**: Speech messages may be muted via window.isSpeechMuted flag

---

## Formatting Implementation Details

### Root Cause (Original Issue)
- Commands stored in registry with escaped newlines: `"command1\ncommand2"`
- Rendered in plain `<code>` tag without `white-space: pre` CSS
- Browser collapsed whitespace, rendering as single wrapped line

### Solution Applied
1. **command_formatter.js** - New module handling formatting
   - `formatCiscoCommand()` - Converts `\n` to actual newlines with indentation
   - `detectIndentation()` - Applies 2-space indent for sub-commands
   - `prepareCommandForCopy()` - Formats for clipboard

2. **CSS Changes** (.command-code-pre)
   - `white-space: pre` - Preserves all whitespace
   - `line-height: 1.5` - Readable line spacing
   - Proper overflow handling for long lines

3. **UI Components** (createEnhancedOptionGrid)
   - Card-style button layout with icon + label + description
   - Hover/selected states with visual feedback
   - Responsive grid layout

4. **Integration** (command_assist_panel.js)
   - Updated 3 render functions to use enhanced grid
   - Added formatter import
   - Options now display with descriptions

---

## Success Criteria

✅ **PASS** if:
- All Part 1 tests pass (command rendering)
- All Part 2 tests pass (copy functionality)
- All Part 3 tests pass (enhanced options UI)
- No console errors during execution
- Formatting matches Toolkit clarity
- Copy button preserves all formatting

❌ **FAIL** if:
- Commands render on single wrapped line
- Copy button produces unformatted text
- Options display as flat chips, not cards
- Console has errors related to formatting
- Visual inconsistencies with Toolkit

