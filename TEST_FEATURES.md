# Feature Testing Guide

## Quick Test Script

### 1. Test Code Block Styling (FIXED)

**Ask the AI:**
```
Write a Python hello world program
```

**What to check:**
- ✅ Code block has **dark background** (#0a0e1a - deep blue/black)
- ✅ No white background visible
- ✅ Glass-style border (subtle white/10 border)
- ✅ Language label "python" at the top
- ✅ Copy button appears on hover (top-right)
- ✅ Code text is light colored (#e2e8f0)

**Expected appearance:**
```
┌──────────────────────────────────┐
│ PYTHON                   [Copy]  │  ← Language label + copy button
├──────────────────────────────────┤
│ # Dark background here           │  ← Dark blue/black bg
│ print("Hello, World!")           │  ← Light text
└──────────────────────────────────┘
```

---

### 2. Test Copy Code Button

**Steps:**
1. Hover over the code block
2. Click "Copy" button (top-right)
3. Button changes to "✓ Copied!" for 2 seconds
4. Open notepad/editor
5. Paste (Ctrl+V)
6. Verify code was copied correctly

---

### 3. Test Suggested Prompts

**Steps:**
1. Refresh page or clear conversation
2. See 6 suggested prompts in a grid
3. Click "Explain quantum computing in simple terms"
4. Input field fills with that text
5. Click Send or press Enter
6. AI responds with explanation

---

### 4. Test LocalStorage Persistence

**Steps:**
1. Send message: "My name is Alex"
2. AI responds
3. Send: "I'm learning Next.js"
4. AI responds
5. **Refresh the page (F5)**
6. Conversation reappears automatically
7. Send: "What's my name and what am I learning?"
8. AI correctly remembers: "Alex" and "Next.js"

---

### 5. Test Clear Conversation

**Steps:**
1. Send a few messages
2. Notice trash icon in header
3. Click trash icon
4. Modal appears: "Clear Conversation?"
5. Click "Cancel" → Modal closes, messages remain
6. Click trash icon again
7. Click "Clear Conversation" → All messages deleted
8. Welcome screen with suggested prompts returns

---

### 6. Test Stop Generation

**Steps:**
1. Ask: "Write a detailed 2000-word essay on artificial intelligence"
2. AI starts streaming response
3. Notice "Send" button changes to red "Stop" button
4. Click "Stop" after a few seconds
5. Streaming stops immediately
6. Incomplete message is removed
7. Can send a new message immediately

---

## Visual Checklist

### Code Blocks
- [ ] Dark background (no white showing)
- [ ] Glass-style border
- [ ] Language label visible
- [ ] Copy button on hover
- [ ] "Copied!" feedback works
- [ ] Code is readable (light text on dark)

### Suggested Prompts
- [ ] 6 prompts visible on empty chat
- [ ] Grid layout (2 columns on desktop, 1 on mobile)
- [ ] Lightning bolt icon visible
- [ ] Hover effect (slight scale + brightness)
- [ ] Click fills input field

### Clear Button
- [ ] Trash icon in header (when messages exist)
- [ ] Modal has glassmorphic backdrop blur
- [ ] "Cancel" and "Clear" buttons work
- [ ] Clears all messages
- [ ] Removes from localStorage

### Stop Button
- [ ] Appears during streaming (replaces Send)
- [ ] Red background (clear "stop" affordance)
- [ ] Stop square icon visible
- [ ] Immediately cancels request
- [ ] Removes incomplete message

### LocalStorage
- [ ] Conversation saves automatically
- [ ] Reloads on page refresh
- [ ] Maintains message order
- [ ] Clears when "Clear" is clicked

---

## Browser Testing

Test in these browsers:

### Chrome/Edge ✅
- Full feature support
- Glassmorphism renders perfectly
- All APIs work

### Firefox ✅
- Full feature support
- Backdrop blur supported
- Clipboard API works

### Safari ✅
- Full feature support
- May need webkit prefixes (already added)
- Test on iOS Safari too

---

## Mobile Testing

### Responsive Layout
- [ ] Suggested prompts stack vertically (1 column)
- [ ] Code blocks scroll horizontally if needed
- [ ] Copy button is touch-friendly (large enough)
- [ ] Clear button visible in header
- [ ] Modal is centered and readable

### Touch Interactions
- [ ] Tap prompts to select
- [ ] Tap copy button (no hover needed)
- [ ] Swipe to scroll code
- [ ] Modal buttons easy to tap

---

## Edge Cases

### LocalStorage Full
**Test:** Fill localStorage with large conversation
**Expected:** Graceful handling or error message

### Very Long Code
**Test:** Ask for 500-line program
**Expected:** Scrollable code block, copy still works

### Multiple Code Blocks
**Test:** Ask for "3 different Python functions"
**Expected:** Each has own copy button

### Stop Mid-Word
**Test:** Stop generation in middle of sentence
**Expected:** Clean removal, no artifacts

### Clear with Streaming
**Test:** Try to clear while AI is responding
**Expected:** Either disabled or stops stream first

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter key submits form
- [ ] Escape closes modal
- [ ] Copy button activates with Enter/Space
- [ ] Focus indicators visible

### Screen Reader
- [ ] Copy button announces "Copy code" / "Copied!"
- [ ] Clear modal has proper labels
- [ ] Suggested prompts are readable
- [ ] Stop button announces state

---

## Performance Testing

### LocalStorage Size
1. Have long conversation (50+ messages)
2. Check localStorage size
3. Verify no lag on save/load

### Code Block Rendering
1. Request multiple large code blocks
2. Check rendering performance
3. Verify smooth scrolling

### Stop Button Response
1. Click stop during streaming
2. Measure response time
3. Should be < 100ms

---

## Success Criteria

All features working if:
- ✅ Code blocks have dark styling (no white)
- ✅ Copy button copies to clipboard
- ✅ Suggested prompts fill input
- ✅ Conversation persists on refresh
- ✅ Clear removes all messages
- ✅ Stop cancels streaming
- ✅ All features accessible via keyboard
- ✅ Works on mobile devices
- ✅ No console errors

---

## Quick Debug Commands

If issues occur:

**Check localStorage:**
```javascript
// In browser console
localStorage.getItem('gemini-chat-history')
```

**Clear localStorage:**
```javascript
localStorage.removeItem('gemini-chat-history')
```

**Check if copy worked:**
```javascript
navigator.clipboard.readText().then(text => console.log(text))
```

**Test abort controller:**
```javascript
// Should see "AbortError" when stopping
```

---

## Report Template

If you find issues, report with this format:

**Issue:** [Brief description]
**Feature:** [Which feature]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Browser:** [Chrome/Firefox/Safari + version]
**Screenshot:** [If applicable]

---

Test everything and let me know if any issues remain!
