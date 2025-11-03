# Visual Feature Guide

## 🎯 What You'll See

### When You First Open the Chatbot

```
┌────────────────────────────────────────────────────┐
│  AI Chatbot                              [Trash]   │  ← Clear button (appears when messages exist)
│  Ask me anything                                   │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                  Welcome! 👋                        │
│  Start a conversation by typing a message below    │
│  or try one of these suggestions:                  │
└────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────┐
│ ⚡ Explain quantum   │ ⚡ Write a Python        │  ← Suggested prompts
│    computing...      │    function to sort...   │    (click to use)
├──────────────────────┼──────────────────────────┤
│ ⚡ What are the best │ ⚡ Create a table        │
│    practices...      │    comparing Next.js...  │
├──────────────────────┼──────────────────────────┤
│ ⚡ Help me debug     │ ⚡ Write a haiku         │
│    this code         │    about coding          │
└──────────────────────┴──────────────────────────┘

┌────────────────────────────────────────────────────┐
│  [Type your message...]              [Send Button] │
└────────────────────────────────────────────────────┘
```

---

### After Sending a Message

```
┌────────────────────────────────────────────────────┐
│  AI Chatbot                              [🗑 Clear]│  ← Clear button now visible
│  Ask me anything                                   │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                                                     │
│  ┌──────────────────────────────────────┐         │
│  │ 👤 You                                │         │  ← Your message (blue gradient)
│  │ Write a Python hello world           │         │
│  └──────────────────────────────────────┘         │
│                                                     │
│         ┌──────────────────────────────────────┐  │
│         │ 🤖 Assistant                          │  │  ← AI response (glass effect)
│         │ Here's a Python hello world:          │  │
│         │                                        │  │
│         │ ┌────────────────────────────────┐   │  │
│         │ │ python           [Copy] ←─────┐│   │  │  ← Copy button (hover to see)
│         │ ├────────────────────────────────┤│   │  │
│         │ │ print("Hello, World!")         ││   │  │
│         │ └────────────────────────────────┘│   │  │
│         └──────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  [Type your message...]                  [Send]    │
└────────────────────────────────────────────────────┘
```

---

### While AI is Responding

```
┌────────────────────────────────────────────────────┐
│  [Type your message...]                  [⏹ Stop] │  ← Stop button (red)
└────────────────────────────────────────────────────┘
                                            ↑
                                    Click to cancel streaming
```

---

### Hover Over Code Block

```
         ┌──────────────────────────────────────┐
         │ 🤖 Assistant                          │
         │                                        │
         │ ┌────────────────────────────────┐   │
         │ │ python           [📋 Copy]     │   │  ← Button visible on hover
         │ ├────────────────────────────────┤   │
         │ │ def hello():                   │   │
         │ │     print("Hello, World!")     │   │
         │ └────────────────────────────────┘   │
         └──────────────────────────────────────┘

After clicking copy:

         │ ┌────────────────────────────────┐   │
         │ │ python           [✓ Copied!]   │   │  ← Success feedback (2 sec)
         │ ├────────────────────────────────┤   │
```

---

### Clear Conversation Modal

```
Click [🗑 Clear] button:

┌────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Blurred backdrop
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░  ┌──────────────────────────────┐  ░░░░░░  │
│  ░░░  │ Clear Conversation?          │  ░░░░░░  │
│  ░░░  │                              │  ░░░░░░  │
│  ░░░  │ This will delete all         │  ░░░░░░  │
│  ░░░  │ messages in the current      │  ░░░░░░  │
│  ░░░  │ conversation. This action    │  ░░░░░░  │
│  ░░░  │ cannot be undone.            │  ░░░░░░  │
│  ░░░  │                              │  ░░░░░░  │
│  ░░░  │        [Cancel]  [Clear      │  ░░░░░░  │
│  ░░░  │                  Conversation]│  ░░░░░░  │
│  ░░░  └──────────────────────────────┘  ░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└────────────────────────────────────────────────────┘
```

---

## 🎬 User Flow Examples

### Example 1: Using Suggested Prompts

```
Step 1: User sees empty chat with 6 suggestions
        ↓
Step 2: User clicks "Write a Python function to sort a list"
        ↓
Step 3: Input field fills with that text
        ↓
Step 4: User clicks Send
        ↓
Step 5: AI streams response with code
        ↓
Step 6: User hovers over code and clicks Copy
        ↓
Step 7: "Copied!" confirmation appears
```

---

### Example 2: Conversation with Memory

```
User: "My name is Sarah"
AI:   "Nice to meet you, Sarah!"

[Saved to localStorage]

User: "I'm learning React"
AI:   "That's great! React is..."

[Updated in localStorage]

[User refreshes page]

[Conversation reloads from localStorage]

User: "What's my name and what am I learning?"
AI:   "Your name is Sarah and you're learning React"
      ↑ AI remembers because full history is sent
```

---

### Example 3: Stopping Long Response

```
User: "Write a 5000-word essay on..."
AI:   Starts streaming...
      "Introduction: The topic of...
       [AI continues typing]"

User: [Clicks Stop button]
      ↓
AI:   Streaming stops immediately
      ↓
      Incomplete message is removed
      ↓
      User can send new message
```

---

## 🎨 Visual Design Elements

### Colors & Styling

**Suggested Prompts:**
- Background: Glass surface (rgba(255, 255, 255, 0.05))
- Hover: Glass elevated (rgba(255, 255, 255, 0.08))
- Icon: Blue (#60a5fa)
- Scale on hover: 1.02x

**Clear Button:**
- Normal: Glass surface with trash icon
- Hover: Lighter glass (white/10)
- Modal backdrop: Black 50% with blur

**Stop Button:**
- Background: Red gradient (red-500 to red-600)
- Icon: Stop square
- Hover: Darker red

**Copy Button:**
- Background: White/10
- Hover: White/20
- Success: Checkmark icon
- Border: White/10

---

## 📱 Mobile Responsive Layout

### Desktop (>768px)
- Suggested prompts: 2 columns
- Code blocks: Full width
- Clear button: Text + icon

### Mobile (<768px)
- Suggested prompts: 1 column (stacked)
- Code blocks: Scroll horizontally if needed
- Clear button: Icon only (smaller header)

---

## ⌨️ Keyboard Interactions

```
Tab:           Navigate through elements
Enter:         Send message (when input focused)
Escape:        Close modal (if open)
Space/Enter:   Activate buttons (when focused)

Focus Order:
1. Skip to chat link
2. Clear button (if visible)
3. Messages area
4. Chat input
5. Send/Stop button
6. Suggested prompts (if visible)
```

---

## 🔄 State Transitions

### Send Button States

```
[Send]  ──click──>  [⏹ Stop]  ──click──>  [Send]
  │                      │                   │
  │                      │                   │
idle            streaming response      response complete
```

### Clear Button States

```
Hidden (no messages)
     ↓
[Trash icon] visible
     ↓ click
[Confirmation Modal]
     ↓ confirm
Messages cleared → Button hidden again
```

### LocalStorage States

```
Empty: null
     ↓ send message
Saving: [{"role":"user","content":"..."}]
     ↓ receive response
Saving: [..., {"role":"assistant","content":"..."}]
     ↓ refresh page
Loading: Parse JSON from localStorage
     ↓
Restore: Set messages state
```

---

## 🎯 Visual Indicators

| Feature | Visual Cue |
|---------|-----------|
| Copy Button | Appears on hover, clipboard icon |
| Copied State | Checkmark + "Copied!" text (2s) |
| Clear Available | Trash icon in header |
| Streaming | Stop button (red), animated dots |
| Empty Chat | 6 suggested prompts in grid |
| Code Language | Small label above code block |
| User Message | Blue gradient, right-aligned |
| AI Message | Glass effect, left-aligned |

---

## 💡 Pro Tips for Users

1. **Quick Start**: Click any suggested prompt to skip typing
2. **Code Copying**: Hover over any code block to reveal copy button
3. **Long Responses**: Use Stop button if response is too verbose
4. **Fresh Start**: Clear button removes everything (with confirmation)
5. **Page Refresh**: Your conversation automatically saves and loads
6. **Follow-ups**: AI remembers context, ask follow-up questions naturally

---

This guide shows exactly what users will see and interact with!
