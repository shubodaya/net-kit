# Command Assist Example Output Formatting - Test Checklist

## Overview
Testing that Example Output sections preserve spacing, indentation, and line breaks exactly like the main generated command output. Both sections now use the same `createCodeBlock()` renderer and CSS styling.

---

## Manual Test Cases

### 1. Basic Example Formatting
**Steps**:
1. Open Deep Chat panel
2. Click **Command Assist** button
3. Navigate to: Cisco → Device Management → "Boot sequence & recovery"
4. View "Example Output" section

**Expected Result**:
- [ ] Example Output displays in monospace `<pre><code>` block
- [ ] Line breaks from `\n` in example string are preserved visually
- [ ] Indentation/spacing within example is preserved exactly
- [ ] Copy button present and styled like Command section's copy button
- [ ] No escaping of special characters visible in output

**Example Content**: 
```
Reload device to apply: reload
Enable boot from specific image to prevent downgrade attacks
```

---

### 2. Multi-line Example Output
**Steps**:
1. Navigate to: Cisco → Interface Configuration → "Interface speed & duplex"
2. View "Example Output" section

**Expected Result**:
- [ ] Multiple lines render on separate lines (not concatenated)
- [ ] Each line maintains proper vertical spacing
- [ ] No extra whitespace added or removed
- [ ] Monospace font applied consistently

**Example Content**:
```
show interfaces g0/0 (verify 'Full duplex, 1000Mb/s') | speed 100 (legacy devices)
```

---

### 3. Copy Button Functionality - Example Output
**Steps**:
1. Navigate to any Cisco command with multi-line example
2. Click **Copy** button in "Example Output" section
3. Paste into text editor or terminal

**Expected Result**:
- [ ] Copied text preserves all line breaks (`\n` becomes actual newline)
- [ ] Indentation copied exactly as displayed
- [ ] No HTML entities or escape sequences in clipboard
- [ ] Pasted content matches visual display perfectly
- [ ] Copy button shows "Copied!" confirmation (2s duration)
- [ ] Copy button text reverts to "Copy" after 2 seconds

**Verification**: Paste should work in:
- [ ] Text editor (line breaks preserved)
- [ ] Terminal (commands executable with proper formatting)
- [ ] Rich text editor (formatting preserved)

---

### 4. Consistent Styling - Command vs Example
**Steps**:
1. View same command result card (shows both sections)
2. Compare "Command" section with "Example Output" section visually

**Expected Result**:
- [ ] Both sections use same `<pre><code>` container styling
- [ ] Font family identical (monospace)
- [ ] Font size identical
- [ ] Line height identical
- [ ] Background color identical
- [ ] Border styling identical
- [ ] Copy button styling identical and in same location
- [ ] Text color identical

**Visual Verification**:
- Command section: Dark background, accent-colored text, monospace font
- Example section: Dark background, accent-colored text, monospace font
- Both should be visually indistinguishable in styling

---

### 5. Complex Example with Show Command Output
**Steps**:
1. Navigate to: Cisco → OSPF → "OSPF database"
2. View both "Command" and "Example Output"

**Expected Result**:
- [ ] Example output showing "show ip ospf database" command renders properly
- [ ] Pipe character `|` preserved in display
- [ ] Output includes parenthetical explanations
- [ ] All spacing and punctuation intact
- [ ] Copying works with special characters

**Example**:
```
show ip ospf database (verify LSA counts) | maximum-paths 4 (enable ECMP load-balance across 4 equal routes)
```

---

### 6. Empty/Missing Example Handling
**Steps**:
1. Navigate to command WITHOUT an example property
2. Check if "Example Output" section appears

**Expected Result**:
- [ ] No "Example Output" section renders if example is null/undefined
- [ ] No empty code block appears
- [ ] Command and Explanation sections display normally
- [ ] No console errors

---

### 7. HTML Entity Escaping in Examples
**Steps**:
1. Find example containing special characters: `<`, `>`, `&`, `"`, `'`
2. View Example Output section

**Expected Result**:
- [ ] Special characters display as literal characters (not HTML entities)
- [ ] Example: `<interface>` shows as `<interface>` (not `&lt;interface&gt;`)
- [ ] Text content method prevents entity interpretation
- [ ] Can copy and paste special characters correctly

---

### 8. Long Single-Line Examples
**Steps**:
1. Navigate to command with long single-line example
2. Check Example Output horizontal scroll behavior

**Expected Result**:
- [ ] Long lines wrap or show horizontal scroll (not clipped)
- [ ] Entire content visible (either wrapped or scrollable)
- [ ] Copy button still accessible
- [ ] No text overflow into adjacent sections

---

### 9. Whitespace Preservation in Examples
**Steps**:
1. Create/find example with deliberate spacing for alignment
   Example: `show ip access-lists (shows match counts per line) | log flag triggers syslog`
2. View Example Output
3. Copy and paste into text editor

**Expected Result**:
- [ ] Multiple spaces between words preserved visually
- [ ] Tabs (if any) preserved in display
- [ ] Alignment intent clear in both display and clipboard
- [ ] `white-space: pre` CSS applied correctly
- [ ] No compression of whitespace

---

### 10. Example vs Advanced Field
**Steps**:
1. View a command result with both "Example Output" and "Advanced" sections
2. Compare rendering

**Expected Result**:
- [ ] "Example Output" is code block (pre/code with monospace)
- [ ] "Advanced" field is regular text paragraph (not code block)
- [ ] Both sections clearly distinguish their purpose
- [ ] Only "Example Output" has Copy button
- [ ] Advanced tips remain as regular text

**Note**: Advanced field should NOT be treated as code

---

### 11. Newline Character Handling
**Steps**:
1. Navigate to multi-line example (with `\n` separators)
   Example: `"show archive\n configure replace flash:..."`
2. View rendering

**Expected Result**:
- [ ] Each `\n` in source becomes visual line break
- [ ] Lines display on separate rows
- [ ] No `\n` visible as literal characters
- [ ] Copy/paste maintains line breaks
- [ ] Example: when pasted, can execute each line separately (if they're commands)

---

### 12. Browser Compatibility
**Test in**:
- [ ] Chrome: Example renders and copies correctly
- [ ] Firefox: Example renders and copies correctly
- [ ] Safari: Example renders and copies correctly
- [ ] Edge: Example renders and copies correctly

**Expected Result**:
- [ ] Consistent rendering across browsers
- [ ] Copy button works in all browsers
- [ ] No visual differences in spacing/formatting
- [ ] Pre/code tags interpreted consistently

---

### 13. Mobile Responsiveness
**Steps**:
1. Open on mobile device or use responsive dev tools
2. View Example Output section

**Expected Result**:
- [ ] Example code block doesn't overflow screen width
- [ ] Text wraps or scrolls horizontally as appropriate
- [ ] Copy button accessible on touch devices
- [ ] Font size readable on small screens
- [ ] No layout shifts or overlapping elements

---

### 14. Source Code Verification
**Steps**:
1. Open browser DevTools
2. Inspect Example Output code block element
3. Check structure

**Expected Result**:
- [ ] Structure: `<div class="command-section"> <h4>Example Output</h4> <pre class="command-code-pre"> <code class="command-code">...</code> </pre> <button class="chip copy-btn">Copy</button> </div>`
- [ ] `<pre>` tag has `class="command-code-pre"`
- [ ] `<code>` tag has `class="command-code"`
- [ ] Text is in code's textContent (not innerHTML) - no HTML interpretation
- [ ] CSS classes match those for Command section

---

### 15. Consistency with createCodeBlock Function
**Steps**:
1. Inspect Command section with DevTools
2. Inspect Example Output section with DevTools
3. Compare HTML structures

**Expected Result**:
- [ ] Both use same component: `createCodeBlock()` function
- [ ] Same CSS classes applied to both
- [ ] Same copy button logic
- [ ] Same pre/code structure
- [ ] Only difference: Command uses `formatAsCommand=true`, Example uses `formatAsCommand=false`
- [ ] This ensures identical styling and functionality

---

## Test Data Structure

### Example Entry in command_registry.js
```javascript
{
  command: "multiline\ncommand\nwith\nescaped",
  example: "output\nline 1\noutput line 2",
  // Other fields...
}
```

**Expected Rendering**:
- Command: Displays with formatCiscoCommand() indentation logic applied
- Example: Displays as-is (preserves exact newlines and spacing)
- Both: Use `white-space: pre` to prevent browser from collapsing whitespace

---

## Automation/Edge Cases

### Special Characters in Examples
```
Example: show tcp | grep 'established' | wc -l
```
- [ ] Single quotes preserved
- [ ] Pipe characters not interpreted
- [ ] Backticks preserved
- [ ] Dollar signs preserved

### Very Long Examples
```
Example: "extremely long single line that goes on and on and should scroll horizontally or wrap depending on CSS..."
```
- [ ] Horizontal scroll available if line exceeds width
- [ ] Copy still captures entire content
- [ ] No text cutoff

### Carriage Returns (if any)
```
Example: "line1\r\nline2" (Windows-style line endings)
```
- [ ] Renders properly regardless of line ending style
- [ ] Copy captures correct line structure

---

## Sign-Off Checklist

### Code Quality
- [ ] `createCodeBlock()` function properly exported from ui_components.js
- [ ] `createCodeBlock()` used by `createCommandResultCard()` for both sections
- [ ] CSS `.command-code-pre` and `.command-code` include `white-space: pre`
- [ ] No hardcoded HTML strings for example output
- [ ] Text content set via textContent (not innerHTML) to prevent entity issues
- [ ] Copy button uses same logic for both Command and Example

### Test Coverage
- [ ] All 15 test cases executed
- [ ] No failures in any browser
- [ ] Mobile tested
- [ ] Special characters tested
- [ ] Multi-line examples tested
- [ ] Copy functionality verified
- [ ] Styling consistency confirmed

### Documentation
- [ ] Code changes documented with comments
- [ ] `createCodeBlock()` function has JSDoc
- [ ] Integration points clear in `createCommandResultCard()`

---

## Summary

**Feature**: Example Output formatting now matches Command formatting
- ✅ Uses same `createCodeBlock()` renderer
- ✅ Applies same CSS styling (white-space: pre, monospace font)
- ✅ Preserves line breaks and indentation
- ✅ Copy button copies exact formatted text
- ✅ Consistent across all commands and browsers

**Status**: Ready for release when all test cases pass
