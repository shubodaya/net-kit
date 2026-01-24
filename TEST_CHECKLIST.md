# Deep Chat Tool Context & Clear Button - Manual Test Checklist

## Overview
This checklist verifies the implementation of:
1. **Tool Context Display** - Shows a short tool summary (2-4 lines) at the top when a tool is selected
2. **Clear Button** - Resets the current tool state back to default landing state

## Test Environment Setup
- [ ] Open the application in a modern browser (Chrome, Firefox, Safari, Edge)
- [ ] Log in with a test account
- [ ] Navigate to the Deep Chat section (Cipher panel)
- [ ] Ensure all Deep Chat tool buttons are visible (.cipher-bots)

---

## Test Suite 1: Tool Context Display

### 1.1 Toolkit Tool Context
- [ ] Click the **Toolkit** button in Deep Chat
- [ ] Verify tool context appears at the top of the panel with:
  - [ ] Title: "🛠️ Tool Kit" (or equivalent)
  - [ ] Summary section with "About this tool:" label (2-3 lines about the tool)
  - [ ] "Expected inputs:" section (1 line describing typical input)
  - [ ] "Output format:" section (1 line describing output)
  - [ ] "Example prompts:" section with 3 bullet points showing sample queries
- [ ] Context styling is visible (accent color border/highlight on examples)
- [ ] Scroll through the tool content - context stays at top
- [ ] Context text is readable with proper contrast

### 1.2 Command Assist Tool Context
- [ ] Click the **Commands** button in Deep Chat
- [ ] Verify tool context appears at the top with:
  - [ ] Title: "🔧 Command Assist"
  - [ ] Summary about command discovery for various vendors
  - [ ] Expected inputs (e.g., "Platform type and action needed")
  - [ ] Output format (e.g., "Relevant commands with explanations")
  - [ ] 3 example prompts related to commands
- [ ] Context displays correctly before any options/content render
- [ ] Information is helpful for new users

### 1.3 Incident Triage Tool Context
- [ ] Click the **Incident Triage** button in Deep Chat
- [ ] Verify tool context appears with:
  - [ ] Title: "🚨 Incident Triage"
  - [ ] Summary about incident response framework
  - [ ] Expected inputs and output format
  - [ ] 3 relevant example prompts
- [ ] Context does not interfere with the options panel below

### 1.4 Threat Intel Tool Context
- [ ] Click the **Threat Intel** button in Deep Chat
- [ ] Verify tool context shows:
  - [ ] Correct title (threat intelligence theme)
  - [ ] Summary about threat intelligence research
  - [ ] Expected inputs/outputs appropriate to the tool
  - [ ] 3 example prompts for threat research queries
- [ ] Layout is consistent with other tools

### 1.5 Phishing Analyzer Tool Context
- [ ] Click the **Phishing Analyzer** button in Deep Chat
- [ ] Verify tool context includes:
  - [ ] Title related to phishing analysis
  - [ ] Summary about phishing detection
  - [ ] Expected inputs (e.g., email headers, message content)
  - [ ] Output format (e.g., risk assessment, red flags)
  - [ ] 3 relevant example prompts
- [ ] Styling matches other tools

### 1.6 Compliance Helper Tool Context
- [ ] Click the **Compliance Helper** button in Deep Chat
- [ ] Verify tool context shows:
  - [ ] Title about compliance framework
  - [ ] Summary for compliance checking
  - [ ] Expected inputs and output format
  - [ ] 3 example prompts for compliance queries
- [ ] Information is clear and relevant

### 1.7 Context Dynamically Updates
- [ ] Start with Toolkit open (context visible)
- [ ] Click to **Commands** tool
- [ ] Verify Toolkit context is **removed** and **Commands context appears**
- [ ] No duplicate context sections visible
- [ ] Content below context updates appropriately for new tool
- [ ] Repeat switching between different tools - context always updates correctly
- [ ] Switching is smooth without flickering

### 1.8 Context Display Consistency
- [ ] All 6 tools show context with the same structure:
  - Title section with tool name
  - Summary section
  - Expected inputs section
  - Output format section
  - Example prompts section (3 items)
- [ ] Styling is consistent across all tools
- [ ] Font sizes, colors, and spacing are uniform
- [ ] No tools missing context display

---

## Test Suite 2: Clear Button

### 2.1 Clear Button Visibility
- [ ] Open Deep Chat panel
- [ ] Locate the **Clear** button in the Deep Chat header
- [ ] Verify Clear button is positioned near other controls (mute, close buttons)
- [ ] Clear button is visible and not hidden behind other elements
- [ ] Clear button styling matches other header buttons (chip class styling)
- [ ] Button text reads "Clear" (or equivalent)
- [ ] Clear button appears even when switching between tools

### 2.2 Clear Button - Toolkit Tool
- [ ] Open **Toolkit** tool
- [ ] Interact with the tool (select options, navigate through screens)
- [ ] Click the **Clear** button
- [ ] Verify:
  - [ ] Tool state resets to intro/landing screen
  - [ ] Tool context display is still visible
  - [ ] Any selections or options are cleared
  - [ ] Tool returns to initial "pick a category" state
  - [ ] No console errors appear

### 2.3 Clear Button - Command Assist Tool
- [ ] Open **Commands** tool
- [ ] Select a platform (Windows/Linux/etc) to advance state
- [ ] Click the **Clear** button
- [ ] Verify:
  - [ ] Tool returns to platform selection screen (first step)
  - [ ] Previous platform selection is cleared
  - [ ] Tool content resets properly
  - [ ] Button is responsive

### 2.4 Clear Button - Incident Triage Tool
- [ ] Open **Incident Triage** tool
- [ ] Select a category/option to advance state
- [ ] Click the **Clear** button
- [ ] Verify tool resets to intro screen
- [ ] Context display remains visible
- [ ] State is properly cleared

### 2.5 Clear Button - Threat Intel Tool
- [ ] Open **Threat Intel** tool
- [ ] Interact with the tool options
- [ ] Click **Clear**
- [ ] Verify state resets to landing state
- [ ] No residual state persists

### 2.6 Clear Button - Phishing Analyzer Tool
- [ ] Open **Phishing Analyzer** tool
- [ ] Make selections/advance through screens
- [ ] Click **Clear**
- [ ] Verify reset to intro screen
- [ ] Tool is ready for new interaction

### 2.7 Clear Button - Compliance Helper Tool
- [ ] Open **Compliance Helper** tool
- [ ] Interact with options
- [ ] Click **Clear**
- [ ] Verify proper reset to landing state

### 2.8 Clear Button Doesn't Affect Navigation
- [ ] Open Toolkit tool
- [ ] Interact with the tool
- [ ] Click **Clear**
- [ ] Verify you can still:
  - [ ] Switch to other Deep Chat tools (other tool buttons work)
  - [ ] Close the Deep Chat panel
  - [ ] Re-open the Deep Chat panel
  - [ ] Switch back to Toolkit and it's in reset state
- [ ] Navigation between tools is not broken

### 2.9 Clear Button Doesn't Affect Global Settings
- [ ] Open a Deep Chat tool
- [ ] Click **Clear**
- [ ] Verify that:
  - [ ] Global application settings are unchanged
  - [ ] User session/login state is unchanged
  - [ ] Dashboard data is not cleared
  - [ ] Other app features continue to work
  - [ ] Activity logs are not affected
  - [ ] Speech mute state is preserved

### 2.10 Clear Button with Tool Context Interaction
- [ ] Open a Deep Chat tool (e.g., Toolkit)
- [ ] Tool context is visible at top
- [ ] Interact with the tool below the context
- [ ] Click **Clear**
- [ ] Verify:
  - [ ] Context remains visible and correctly displays (not cleared)
  - [ ] Tool state below context resets
  - [ ] User can see context again immediately for guidance

### 2.11 Rapid Tool Switching with Clear
- [ ] Open Toolkit
- [ ] Click Clear
- [ ] Switch to Commands (without clicking Clear)
- [ ] Click Clear
- [ ] Switch to Incident Triage
- [ ] Click Clear
- [ ] Verify each tool properly clears its state
- [ ] No state leakage between tools
- [ ] Application remains stable

### 2.12 Clear Button Responsiveness
- [ ] Click Clear button multiple times rapidly
- [ ] Verify:
  - [ ] Button responds consistently
  - [ ] No duplicate or cascading resets occur
  - [ ] Tool state is only reset once per click
  - [ ] No console errors

---

## Test Suite 3: Integration & Edge Cases

### 3.1 Tool Context Source Verification
- [ ] Open browser DevTools (F12)
- [ ] Navigate to Network/Sources tab
- [ ] Verify tool context data comes from tool_registry.js
- [ ] Check that contexts are not hardcoded in individual tool panels

### 3.2 Accessibility
- [ ] Tab through Deep Chat header
- [ ] Verify **Clear** button is reachable via keyboard
- [ ] Press Enter/Space on Clear button
- [ ] Verify Clear button has proper aria-label or title attribute
- [ ] Screen reader announces Clear button properly

### 3.3 Mobile Responsiveness
- [ ] Test on mobile/tablet viewport (if applicable)
- [ ] Verify tool context displays properly on small screens
- [ ] Verify Clear button is accessible on mobile
- [ ] Verify context text wraps appropriately
- [ ] No UI elements overlap or become hidden

### 3.4 Browser Compatibility
- [ ] Test in at least 2 different browsers:
  - [ ] Chrome/Edge
  - [ ] Firefox
  - [ ] Safari (if available)
- [ ] Verify tool context displays correctly in all
- [ ] Verify Clear button functions in all browsers
- [ ] No styling or functionality issues

### 3.5 Tool Context with Input Fields
- [ ] Open a Deep Chat tool that has input fields below context
- [ ] Tool context should not interfere with input interaction
- [ ] Users can still type in input fields
- [ ] Clear button clears tool state, not input field directly

### 3.6 Persistence Check
- [ ] Open a Deep Chat tool
- [ ] Close the Deep Chat panel
- [ ] Re-open Deep Chat
- [ ] Verify tool state does not persist (if expected)
- [ ] Verify tool context displays correctly on re-open

---

## Test Suite 4: Visual/Style Verification

### 4.1 Tool Context Styling
- [ ] Context container has proper background color
- [ ] Context has visible border (if designed)
- [ ] Text colors have proper contrast (readability)
- [ ] Font sizes are appropriate (not too small)
- [ ] Padding/spacing is consistent with app design
- [ ] Accent colors used for emphasis match app theme

### 4.2 Example Prompts Styling
- [ ] Example prompts section has distinct styling
- [ ] Bullet points are clearly visible
- [ ] Text in example prompts is readable
- [ ] Example prompts stand out from other sections
- [ ] Hover states work if applicable

### 4.3 Clear Button Styling
- [ ] Clear button matches other header button styles
- [ ] Clear button has visible hover state
- [ ] Clear button has visible active/pressed state
- [ ] Clear button is not accidentally styled same as close button
- [ ] Button text is readable (font size, color)

### 4.4 No Visual Glitches
- [ ] Tool context appears smoothly when switching tools
- [ ] No flickering or layout shifts when context loads
- [ ] No overlapping elements
- [ ] Scrolling doesn't cause visual issues with context
- [ ] Context is properly scoped to Deep Chat panel (not affecting other UI)

---

## Summary

### Pass Criteria
- **Tool Context Display**: All 6 tools show consistent context with title, summary, inputs, outputs, and 3 example prompts
- **Clear Button**: Button is visible, functional for all 6 tools, resets state without affecting navigation or global settings
- **Integration**: Tool contexts are configuration-driven (from tool_registry.js), component-based, and don't break existing functionality

### Test Coverage
- [ ] All 6 Deep Chat tools tested individually
- [ ] Tool switching and context updates verified
- [ ] Clear button tested on all tools
- [ ] Global settings/navigation not affected by Clear
- [ ] Accessibility and mobile considerations checked
- [ ] Visual consistency verified across tools
- [ ] No console errors during testing

### Sign-Off
- [ ] All tests passed
- [ ] No critical bugs found
- [ ] Ready for production deployment

---

## Bug Report Template
If issues are found, report with:
1. **Tool affected**: (Toolkit | Commands | Triage | Intel | Phishing | Compliance)
2. **Issue description**: (What went wrong)
3. **Steps to reproduce**: (How to see the bug)
4. **Expected behavior**: (What should happen)
5. **Actual behavior**: (What happened instead)
6. **Browser/Device**: (Where you found it)
7. **Screenshots/Video**: (Visual evidence if possible)
