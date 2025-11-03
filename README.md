# Gemini Chatbot with Glassmorphism UI

A beautiful AI-powered chatbot built with Next.js, LangChain, and Google Gemini 2.0 Flash, featuring a premium glassmorphism design aesthetic.

## Features

- ✨ **Glassmorphism Design** - Premium translucent UI with backdrop blur effects
- 🚀 **Streaming Responses** - Real-time token streaming for instant feedback
- 🤖 **Google Gemini 2.0 Flash** - Powered by Google's latest fast AI model
- 📱 **Responsive Design** - Works beautifully on desktop and mobile
- 🎨 **Modern Typography** - Bricolage Grotesque headings + Inter body text

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **AI**: LangChain + Google Gemini 2.0 Flash
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
2. **API Request**: Frontend sends POST request to `/api/chat` endpoint
3. **LangChain Processing**: API route initializes LangChain with Gemini model
4. **Streaming**: Gemini streams response tokens via Server-Sent Events (SSE)
5. **Real-time Display**: Frontend displays tokens as they arrive in glass message bubble

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

## Browser Support

- ✅ Chrome/Edge (full backdrop blur support)
- ✅ Firefox (full backdrop blur support)
- ✅ Safari (full backdrop blur support)
- ⚠️ Older browsers fallback to solid glass colors

## Future Enhancements

- [ ] Conversation history persistence (localStorage)
- [ ] Multi-conversation sidebar
- [ ] Message regeneration and editing
- [ ] Export conversation as text/JSON
- [ ] Dark/light theme toggle
- [ ] Markdown rendering in responses
- [ ] Code syntax highlighting
- [ ] Voice input/output

## License

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [LangChain](https://langchain.com/)
- AI by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Design inspired by [Glassmorphism](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)
