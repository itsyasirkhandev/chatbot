# Gemini Chatbot

A beautiful AI-powered chatbot built with Next.js, LangChain, and Google Gemini 2.5 Flash, featuring a clean and minimal design aesthetic.

## Features

### Core Features
- ✨ **Clean Minimal Design** - Beautiful light theme with gray backgrounds and solid styling
- 🚀 **Streaming Responses** - Real-time token streaming for instant feedback
- 🤖 **Google Gemini 2.5 Flash** - Powered by Google's latest fast AI model
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

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom utility classes
- **AI**: LangChain + Google Gemini 2.5 Flash
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
- `npm run type-check` - Run TypeScript type checking

### Code Structure
```
app/
├── api/chat/
│   └── route.ts          # API endpoint for chat
├── components/
│   └── CodeBlock.tsx     # Code display component
├── globals.css           # Global styles
├── layout.tsx            # App layout
└── page.tsx              # Main chat interface
```

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
- 🔜 Multi-language support
- 🔜 Plugin system for custom AI models
- 🔜 Real-time collaboration features
- 🔜 Advanced conversation search

## License

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [LangChain](https://langchain.com/)
- AI by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Design inspired by clean, minimal UI principles with modern color schemes
