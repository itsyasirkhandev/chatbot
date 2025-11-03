# Gemini Chatbot with Glassmorphism UI

A beautiful AI-powered chatbot built with Next.js, LangChain, and Google Gemini 2.0 Flash, featuring a premium glassmorphism design aesthetic.

## Features

### Core Features
- ✨ **Glassmorphism Design** - Premium translucent UI with backdrop blur effects
- 🚀 **Streaming Responses** - Real-time token streaming for instant feedback
- 🤖 **Google Gemini 2.0 Flash** - Powered by Google's latest fast AI model
- 📱 **Responsive Design** - Works beautifully on desktop and mobile
- 🎨 **Modern Typography** - Bricolage Grotesque headings + Inter body text

### Content & Formatting
- 📝 **Markdown Support** - Beautiful formatting with code syntax highlighting
- 📋 **Copy Code Button** - One-click copy for code blocks with visual feedback
- 🎯 **Suggested Prompts** - Quick-start examples to get conversations flowing

### User Experience
- ♿ **Accessibility First** - WCAG compliant with screen reader support, keyboard navigation, and ARIA labels
- 🧠 **Conversation Memory** - Chatbot remembers your entire conversation for contextual responses
- 💾 **Persistent History** - Conversations saved to localStorage, resume after refresh
- 🗑️ **Clear Conversation** - Reset chat with confirmation dialog
- ⏹️ **Stop Generation** - Cancel AI responses mid-stream

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **AI**: LangChain + Google Gemini 2.0 Flash
- **Markdown**: react-markdown with GitHub Flavored Markdown & syntax highlighting
- **Deployment**: Vercel (zero-config)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. Clone the repository and navigate to the project:
```bash
cd gemini-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or use the start script
./start.ps1  # Windows PowerShell
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
gemini-chatbot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # Streaming API endpoint
│   ├── globals.css            # Global styles + glassmorphism utilities
│   ├── layout.tsx             # Root layout with fonts
│   └── page.tsx               # Main chat interface
├── .env.local                 # Environment variables (API key)
└── start.ps1                  # Quick start script
```

## How It Works

1. **User Input**: User types a message in the glass input field
2. **API Request**: Frontend sends POST request to `/api/chat` endpoint with full conversation history
3. **LangChain Processing**: API route converts messages to LangChain format (HumanMessage/AIMessage)
4. **Context-Aware Response**: Gemini processes entire conversation history for contextual understanding
5. **Streaming**: Gemini streams response tokens via Server-Sent Events (SSE)
6. **Real-time Display**: Frontend displays tokens as they arrive in glass message bubble

### Conversation Memory

The chatbot maintains conversation context by:
- Storing all messages in React state
- Sending complete conversation history with each request
- Using LangChain's message format (HumanMessage for user, AIMessage for assistant)
- Allowing the AI to reference previous messages

**Example:**
```
You: My name is John
AI: Nice to meet you, John! How can I help you today?
You: What's my name?
AI: Your name is John, as you mentioned earlier.
```

## Customization

### Change AI Model

Edit `app/api/chat/route.ts`:
```typescript
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.0-flash-exp', // Change model here
  streaming: true,
});
```

### Adjust Glassmorphism Effects

Edit `app/globals.css` to modify glass opacity and blur:
```css
.glass-surface {
  background: rgba(255, 255, 255, 0.05); /* Adjust opacity */
  backdrop-filter: blur(20px);           /* Adjust blur */
}
```

### Modify Colors

The gradient background and accent colors can be customized in `app/globals.css` and component classes.

## Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key
5. Click "Deploy"

### Method 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

When prompted, add the `GEMINI_API_KEY` environment variable.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

## Accessibility Features

This chatbot is built with accessibility as a priority:

- **Semantic HTML**: Proper use of `<header>`, `<main>`, `<article>`, and other semantic elements
- **ARIA Labels**: All interactive elements have descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader Support**: Live region announcements for message status updates
- **Skip Links**: Keyboard users can skip directly to the chat input
- **High Contrast**: Enhanced border visibility (2px borders) for better contrast
- **Focus Management**: Automatic focus return to input after message submission
- **Status Indicators**: Clear loading states with ARIA announcements

**Keyboard Shortcuts:**
- `Tab` / `Shift+Tab` - Navigate between elements
- `Enter` - Submit message
- `Skip to chat input` link appears when navigating with keyboard

## Browser Support

- ✅ Chrome/Edge (full backdrop blur support)
- ✅ Firefox (full backdrop blur support)
- ✅ Safari (full backdrop blur support)
- ⚠️ Older browsers fallback to solid glass colors

## Markdown Support

The chatbot supports rich formatting in responses:

- **Code blocks** with syntax highlighting (Python, JavaScript, etc.)
- **Headings** (H1-H4) with proper hierarchy
- **Lists** (ordered and unordered)
- **Tables** with glassmorphic styling
- **Blockquotes** with accent border
- **Links** with hover effects
- **Inline code** with subtle background
- **Bold** and *italic* text

Try asking: "Show me a Python hello world example" or "Create a markdown table"

## Feature Deep Dive

### 📋 Copy Code Button
Every code block includes a hover-activated copy button:
- Click to copy code to clipboard
- Visual feedback ("Copied!" message for 2 seconds)
- Works with all programming languages
- Preserves code formatting

### 🗑️ Clear Conversation
Manage your chat history easily:
- "Clear" button appears in header when messages exist
- Confirmation dialog prevents accidental deletion
- Removes all messages and clears localStorage
- Returns focus to input for immediate use

### 🎯 Suggested Prompts
Get started faster with example prompts:
- 6 curated suggestions displayed on empty chat
- Click any prompt to auto-fill input
- Covers common use cases (coding, explanations, creative)
- Hover effects for better interactivity

### 💾 LocalStorage Persistence
Never lose your conversation:
- Automatically saves all messages to browser storage
- Conversations restored when you return
- Persists across page refreshes
- Clear button removes saved data

### ⏹️ Stop Generation
Take control of AI responses:
- "Stop" button replaces "Send" during streaming
- Immediately cancels ongoing request
- Prevents wasted API calls
- Red styling for clear visual distinction

### 🧠 Conversation Memory
Context-aware AI conversations:
- Sends full conversation history with each message
- AI can reference any previous message
- Natural follow-up questions work seamlessly
- Memory persists throughout session (and saved to localStorage)

## User Guide

### Getting Started
1. Open the chatbot at http://localhost:3000
2. Click a suggested prompt or type your own message
3. Watch the AI response stream in real-time
4. Continue the conversation - the AI remembers context

### Tips & Tricks
- **Code blocks**: Hover over code to see the copy button
- **Stop responses**: Click "Stop" if response is too long
- **Clear chat**: Use the trash icon in the header to start fresh
- **Persistent history**: Your conversations are saved automatically
- **Markdown support**: Ask for tables, lists, code examples - they'll be beautifully formatted

### Example Prompts
```
"My name is Alice. I'm learning React."
[AI responds]
"What's my name and what am I learning?"
[AI correctly remembers: "Your name is Alice and you're learning React"]
```

## Future Enhancements

✅ = Implemented | 🔜 = Planned

- ✅ Conversation history persistence (localStorage)
- ✅ Clear conversation button
- ✅ Copy code blocks button
- 🔜 Multi-conversation sidebar with session management
- 🔜 Message regeneration and editing
- 🔜 Export conversation as Markdown/JSON
- 🔜 Dark/light theme toggle
- 🔜 Voice input/output
- 🔜 Image upload support (Gemini Vision)
- 🔜 Auto-resize textarea for long prompts
- 🔜 Keyboard shortcuts (Ctrl+K to clear, etc.)

## License

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [LangChain](https://langchain.com/)
- AI by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Design inspired by [Glassmorphism](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)
