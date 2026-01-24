# Quick Reference: Tool Context & Clear Button Implementation

## For Developers

### How to Update Tool Context
1. Edit **`data/tool_registry.js`**
2. Find `deepChatToolContexts` object
3. Update the relevant tool's entry (e.g., `toolkit`, `commands`)
4. Modify: `summary`, `expectedInputs`, `outputFormat`, or `examplePrompts`
5. Changes appear immediately in UI (no code changes needed elsewhere)

**Example**:
```javascript
deepChatToolContexts.toolkit = {
  id: "toolkit",
  name: "Tool Kit",
  summary: "New summary here...",  // ← Update this
  expectedInputs: "New inputs...",   // ← Or this
  outputFormat: "New format...",     // ← Or this
  examplePrompts: [                  // ← Or these
    "New example 1",
    "New example 2", 
    "New example 3"
  ]
};
```

### How to Add a New Deep Chat Tool
1. Create tool panel file: `components/my_tool_panel.js`
2. Add to **`data/tool_registry.js`**:
   ```javascript
   deepChatToolContexts.myTool = {
     id: "myTool",
     name: "My Tool",
     summary: "...",
     expectedInputs: "...",
     outputFormat: "...",
     examplePrompts: ["...", "...", "..."]
   };
   ```

3. In your panel's render function:
   ```javascript
   import { updateToolContextDisplay } from "./tool_context_display.js";
   
   export function renderMyTool(container) {
     if (!container) return;
     updateToolContextDisplay("myTool", container);  // ← Add this line
     // ... rest of rendering
   }
   ```

4. Add clear function:
   ```javascript
   export function clearMyTool() {
     initMyTool();
     const container = document.getElementById("cipherDeepBody");
     if (container) renderMyTool(container);
   }
   ```

5. In **`app.js`**, add to imports and Clear button handler:
   ```javascript
   import { clearMyTool } from "./components/my_tool_panel.js";
   
   // In Clear button handler:
   if (botType === "myTool") clearMyTool();
   ```

### How to Style Tool Context
Edit **`styles.css`** and modify these classes:
- `.tool-context-display` - Main container
- `.tool-context-title` - Title text
- `.tool-context-text` - Body text
- `.tool-context-examples` - Examples section
- `.tool-context-prompt-item` - Individual prompts

All classes start with `.tool-context-` for easy finding.

### Files Quick Links
| File | Purpose |
|------|---------|
| `components/tool_context_display.js` | Display logic (don't edit) |
| `data/tool_registry.js` | **Edit here for content** |
| `styles.css` | **Edit here for styling** |
| `components/*_panel.js` | Import + call context + add clear |
| `app.js` | Wire Clear button (already done) |
| `index.html` | Clear button HTML (already done) |

### Testing Locally
1. Open app in browser
2. Open Deep Chat panel
3. Click a tool button
4. **See**: Context appears at top
5. **Interact**: Use tool normally
6. **Click Clear**: Tool resets to landing state, context still visible
7. **Switch tools**: Context updates dynamically

### Common Tasks

**Q: Tool context not showing?**
- [ ] Check `tool_registry.js` has entry for your tool ID
- [ ] Check tool panel imports `updateToolContextDisplay`
- [ ] Check tool panel calls `updateToolContextDisplay(toolId, container)`
- [ ] Check container is the `cipherDeepBody` element

**Q: Clear button not working?**
- [ ] Check tool has `clear` + `init` + `render` functions
- [ ] Check `app.js` imports the clear function
- [ ] Check `app.js` Clear button handler routes to your tool
- [ ] Check tool's `data-bot` attribute matches routing

**Q: Context styling looks wrong?**
- [ ] Check `.tool-context-*` classes in `styles.css`
- [ ] Check CSS variables like `var(--panel)`, `var(--accent)`
- [ ] Check browser DevTools for CSS conflicts
- [ ] Verify no CSS specificity issues

**Q: Adding a new example prompt?**
- [ ] Edit `deepChatToolContexts` in `tool_registry.js`
- [ ] Add string to `examplePrompts` array (3 max for clean UI)
- [ ] Save file
- [ ] Reload browser

### Architecture in 30 Seconds
```
User clicks tool button
  ↓
App routes to init + render function
  ↓
render() calls updateToolContextDisplay()
  ↓
updateToolContextDisplay() reads tool_registry.js
  ↓
Creates DOM with context + appends to top
  ↓
Rest of tool renders below context
  
When Clear clicked:
  ↓
Clear handler routes to tool's clearXxx()
  ↓
clearXxx() calls initXxx() + renderXxx()
  ↓
Tool resets, context re-displays
```

### Performance Notes
- Tool context is lightweight (1 DOM element)
- Context is removed/recreated on tool switch (not hidden)
- No memory leaks (event listeners removed with DOM)
- No impact on other app features

### Browser Support
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile browsers ✅

### Accessibility
- Clear button has `aria-label`
- Context text uses semantic HTML
- Keyboard navigation supported
- Screen reader compatible

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Context shows old data | Hard refresh (Ctrl+F5) |
| Clear button gray/disabled | Check tool has active class |
| Context text overlaps tool UI | Check CSS padding/gap |
| Context not updating on tool switch | Check `updateToolContextDisplay()` called |
| Clear button doesn't work | Check routing in app.js handler |
| Mobile context is cut off | Check responsive CSS media queries |

### Questions?
Check these files for patterns:
- `components/toolkit_panel.js` - Complete example
- `data/tool_registry.js` - All context data here
- `TEST_CHECKLIST.md` - Expected behavior reference
- `CHANGES_SUMMARY.md` - Detailed implementation docs
