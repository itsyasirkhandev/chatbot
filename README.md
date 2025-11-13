# Gemini Chatbot

A beautiful AI-powered chatbot built with Next.js, LangChain, and Google Gemini 2.5 Flash, featuring a clean and minimal design aesthetic.

## Features

### Core Features
- ✨ **Clean Minimal Design** - Beautiful light/dark theme with CSS variable-driven theming
- 🚀 **Streaming Responses** - Real-time token streaming for instant feedback
- 🤖 **Multi-Provider Support** - Google Gemini 2.5 Flash, Hugging Face, and DeepSeek-R1
- 🧠 **Thinking Model Support** - Automatic detection and rendering of `<think>` tags for reasoning models
- 📱 **Responsive Design** - Works beautifully on desktop and mobile
- 🎨 **Modern Typography** - Bricolage Grotesque headings + Inter body text
- 🌓 **Dark Mode** - Persistent dark/light theme toggle with localStorage

### Content & Formatting
- 📝 **Markdown Support** - Beautiful formatting with code syntax highlighting
- 📋 **Copy Code Button** - One-click copy for code blocks with visual feedback
- 🎯 **Suggested Prompts** - Quick-start examples to get conversations flowing

### User Experience
- ♿ **Accessibility First** - WCAG compliant with screen reader support, keyboard navigation, and ARIA labels
- 🧠 **Conversation Memory** - Chatbot remembers your entire conversation for contextual responses
- 💾 **Multi-Conversation Management** - Create, rename, delete, and switch between conversations
- 📂 **Persistent History** - All conversations saved to localStorage, resume after refresh
- 🗑️ **Clear Conversation** - Reset chat with confirmation dialog
- ⏹️ **Stop Generation** - Cancel AI responses mid-stream
- ⚙️ **System Prompts** - Configure custom AI behavior with system messages
- 📊 **Document Similarity** - Built-in embeddings tool for comparing text similarity

## Design Features

### 🎨 Clean Light Theme
- **Solid Gray Backgrounds** - Using subtle gray tones (#f3f4f6, #ffffff)
- **Minimal Interface** - Clean cards and containers with subtle borders
- **Readable Typography** - Optimized for long conversations and readability
- **Accessible Colors** - High contrast for better visibility

### 💡 Visual Elements
- **Soft Shadows** - Subtle elevation with minimal shadows
- **Hover States** - Smooth transitions and interactive feedback
- **Consistent Spacing** - Proper padding and margins throughout
- **Modern Icons** - Clean SVG icons for better clarity

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS v4 with CSS variable-driven theming
- **AI Providers**: 
  - LangChain + Google Gemini 2.5 Flash (default)
  - Hugging Face Inference API (MiniMax-M2)
  - DeepSeek-R1 (reasoning model)
- **Markdown**: react-markdown with GitHub Flavored Markdown & syntax highlighting
- **Architecture**: Component-based with custom hooks for state management
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
# Optional: Only needed if using Hugging Face or DeepSeek providers
HUGGINGFACE_API_KEY=your_huggingface_key_here
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
│   │   ├── chat/
│   │   │   └── route.ts          # Streaming API endpoint (multi-provider)
│   │   └── embed/
│   │       └── route.ts          # Embeddings & similarity API
│   ├── components/               # Reusable UI components
│   │   ├── ChatInput.tsx         # Message input form
│   │   ├── ClearConfirmModal.tsx # Confirmation dialog
│   │   ├── CodeBlock.tsx         # Code syntax highlighting
│   │   ├── EmptyState.tsx        # Welcome screen
│   │   ├── Header.tsx            # App header with controls
│   │   ├── MessageBubble.tsx     # Individual message rendering
│   │   ├── MessageList.tsx       # Messages container
│   │   ├── Sidebar.tsx           # Conversation list
│   │   ├── SkeletonLoader.tsx    # Loading placeholder
│   │   ├── SystemPromptModal.tsx # System message editor
│   │   └── ThinkingMessage.tsx   # Reasoning display
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAnnouncements.ts   # Screen reader announcements
│   │   ├── useConversations.ts   # Conversation management
│   │   ├── useDarkMode.ts        # Theme toggling
│   │   └── useScrollToBottom.ts  # Auto-scroll behavior
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── utils/
│   │   └── chat.ts               # Utility functions (parsing, etc.)
│   ├── embeding/
│   │   └── page.tsx              # Document similarity tool
│   ├── globals.css               # Global styles + theme variables
│   ├── layout.tsx                # Root layout with fonts
│   └── page.tsx                  # Main chat interface (324 lines)
├── .env.local                    # Environment variables
├── WARP.md                       # Warp AI context (local only)
└── start.ps1                     # Quick start script
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

### Modify Colors and Layout

Edit `app/globals.css` to customize the light theme:
```css
/* Adjust background colors */
.glass-surface {
  background: #f3f4f6; /* Change background color */
  border: 1px solid #e5e7eb; /* Border color */
}

.glass-elevated {
  background: #ffffff; /* Elevated surfaces */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); /* Shadow intensity */
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
| `HUGGINGFACE_API_KEY` | Hugging Face API key | Only when using HF/DeepSeek providers |

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

## API Documentation

### Chat Endpoint

**Endpoint**: `POST /api/chat`

**Description**: Streams AI responses from Google Gemini with conversation context.

**Request Body**:
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"},
      {"role": "assistant", "content": "I am doing well! How can I help you?"},
      {"role": "user", "content": "What did I just ask you?"}
    ]
  }'
```

**Response**: Server-Sent Events (SSE) stream of tokens

**Response Headers**:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Response Example**:
```
data: {"token":"Hello"}:status: done
data: {"token":" there"}:status: done
data: {"token":"!"}:status: done
data: {"token":" You"}:status: done
...
data: [DONE]
```

**Error Responses**:
- `400 Bad Request`: Invalid message format
- `500 Internal Server Error`: API configuration or processing error

### Error Handling

The API handles various error scenarios:

```typescript
// Invalid request format
{
  "error": "Invalid request format. Messages array is required."
}

// API key missing
{
  "error": "GEMINI_API_KEY environment variable is required"
}

// Invalid messages structure
{
  "error": "Each message must have 'role' and 'content' properties"
}
```

## Usage Examples

### Basic Conversation
```bash
# Start a conversation
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain quantum computing in simple terms"}
    ]
  }'
```

### Multi-turn Conversation
```bash
# Continue the conversation with context
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain quantum computing in simple terms"},
      {"role": "assistant", "content": "Quantum computing is like... [response]"},
      {"role": "user", "content": "Can you give me a practical example?"}
    ]
  }'
```

### Code Generation Example
```bash
# Ask for code with context
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {"role": "user", "content": "Write a Python function to calculate fibonacci numbers"},
      {"role": "assistant", "content": "Here is a Python function to calculate fibonacci numbers:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n```\n\nWould you like me to optimize this?"},
      {"role": "user", "content": "Yes, please optimize it"}
    ]
  }'
```

### Integration Examples

#### JavaScript/TypeScript
```typescript
async function chatWithAI(messages: {role: string, content: string}[]) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        try {
          const { token } = JSON.parse(data);
          console.log(token);
        } catch (e) {
          // Handle parsing errors
        }
      }
    }
  }
}
```

#### Python
```python
import requests
import json

def chat_with_ai(messages):
    response = requests.post(
        'http://localhost:3000/api/chat',
        json={'messages': messages},
        stream=True
    )
    
    for line in response.iter_lines():
        if line.startswith(b'data: '):
            data = line[6:].decode('utf-8')
            if data == '[DONE]':
                break
            try:
                token_data = json.loads(data)
                print(token_data['token'], end='', flush=True)
            except json.JSONDecodeError:
                continue
```

## Troubleshooting

### Common Issues

#### 1. API Key Issues
**Problem**: `GEMINI_API_KEY environment variable is required`
**Solution**:
- Create a `.env.local` file in the project root
- Add your API key: `GEMINI_API_KEY=your_api_key_here`
- Restart the development server

#### 2. Build Errors
**Problem**: TypeScript compilation errors
**Solution**:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Or reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 3. Streaming Issues
**Problem**: Responses don't stream, appear all at once
**Solution**:
- Check browser compatibility (requires modern browser)
- Verify Server-Sent Events support
- Check network connectivity
- Try with curl to isolate browser issues

#### 4. CORS Errors
**Problem**: Cross-origin request blocked
**Solution**:
- Ensure you're making requests to the same origin
- Check browser developer console for specific CORS errors
- For external integrations, configure CORS properly

#### 5. Memory/Performance
**Problem**: Long conversations become slow
**Solution**:
- Conversations are stored in localStorage
- Clear old conversations periodically
- Consider implementing conversation limits for production

### Development Issues

#### Hot Reload Not Working
```bash
# Reset Next.js development environment
npx next clean
npm run dev
```

#### Environment Variables Not Loading
- Ensure `.env.local` is in the project root
- Restart the development server after changes
- Check variable names match exactly (case-sensitive)

#### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules
npm install
```

## Development

### Project Setup
```bash
# Clone and setup
git clone <repository-url>
cd gemini-chatbot
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your API key

# Start development
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Run TypeScript type checking

### Code Architecture

The application follows a **modular component-based architecture**:

**Frontend (app/page.tsx - 324 lines)**
- Main orchestrator using custom hooks for state management
- Delegates rendering to focused, single-responsibility components
- Handles API communication and streaming logic

**Custom Hooks (app/hooks/)**
- `useConversations` - Full CRUD for conversation management
- `useDarkMode` - Theme state with localStorage persistence
- `useScrollToBottom` - Auto-scroll and scroll button visibility
- `useAnnouncements` - Screen reader announcements for a11y

**UI Components (app/components/)**
- Atomic, reusable components with clear props interfaces
- Separated by concern: modals, messages, input, layout
- Each component handles its own rendering and local state

**API Routes (app/api/)**
- `chat/route.ts` - Multi-provider streaming chat (Gemini/HF/DeepSeek)
- `embed/route.ts` - Document embeddings and similarity

**Benefits:**
- 68% reduction in main page.tsx size (878 → 324 lines)
- Improved testability and maintainability
- Better IDE intellisense and type safety
- Easier onboarding for new developers

### Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper documentation
4. **Test thoroughly** across different browsers
5. **Run linting**: `npm run lint`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

#### Code Style
- Use TypeScript for all new code
- Follow existing ESLint configuration
- Add JSDoc comments for functions
- Use semantic commit messages
- Test accessibility with keyboard navigation

#### Accessibility Requirements
- All interactive elements must have ARIA labels
- Support keyboard navigation
- Maintain 4.5:1 contrast ratio
- Test with screen readers
- Use semantic HTML elements

## Feature Status

✅ = Implemented | 🔜 = Planned

### Recently Completed (2025)
- ✅ **Multi-conversation sidebar** - Create, switch, rename, delete conversations
- ✅ **Dark/light theme toggle** - Persistent theme with localStorage
- ✅ **System prompts** - Configure AI behavior with custom instructions
- ✅ **Multi-provider support** - Gemini, Hugging Face, DeepSeek-R1
- ✅ **Thinking model support** - Automatic `<think>` tag detection and rendering
- ✅ **Document embeddings tool** - Text similarity comparison
- ✅ **Component refactoring** - Modular architecture with custom hooks
- ✅ **Conversation history persistence** - localStorage with full CRUD
- ✅ **Copy code blocks** - One-click copy with visual feedback
- ✅ **Clear conversation** - Reset with confirmation dialog

### Planned Enhancements
- 🔜 Message regeneration and editing
- 🔜 Export conversation as Markdown/JSON
- 🔜 Voice input/output
- 🔜 Image upload support (Gemini Vision)
- 🔜 Auto-resize textarea for long prompts
- 🔜 Keyboard shortcuts (Ctrl+K to clear, etc.)
- 🔜 Multi-language support
- 🔜 Advanced conversation search
- 🔜 Conversation folders/organization
- 🔜 Streaming indicators for thinking models

## License

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [LangChain](https://langchain.com/)
- AI by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Design inspired by clean, minimal UI principles with modern color schemes
