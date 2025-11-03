# Quick Start Guide - Multi-Model Chatbot

## ✅ Setup Complete

Your chatbot is now configured with three AI models:
1. **Gemini** - Google's fast conversational model
2. **MiniMax-M2** - Hugging Face conversational model
3. **DeepSeek-R1** - Advanced reasoning model

## 🚀 How to Use

### Start the Server
```bash
npm run dev
```
Server will start at: `http://localhost:3000`

### Using the Chat Interface

1. **Open your browser** to `http://localhost:3000`

2. **Select a model** from the dropdown in the header:
   - Click the dropdown at the top of the page
   - Choose: Gemini, Hugging Face (MiniMax-M2), or DeepSeek-R1

3. **Start chatting**:
   - Type your message in the input box
   - Press Enter or click Send
   - Watch the AI respond in real-time with streaming

4. **Switch models anytime**:
   - Select a different model from the dropdown
   - Your next message will use the new model
   - Previous conversation history is maintained

### Features

✨ **Real-time Streaming** - See responses as they're generated
🎨 **Glassmorphism Design** - Beautiful, modern interface
💬 **Full Conversation Context** - Models remember the conversation
🔄 **Model Switching** - Change models without losing context
📱 **Responsive** - Works on desktop, tablet, and mobile
♿ **Accessible** - Screen reader support and keyboard navigation
🗑️ **Clear History** - Reset conversation with one click

## 📊 Model Comparison

| Model | Provider | Speed | Best For |
|-------|----------|-------|----------|
| Gemini | Google | ⚡ Fast | General conversation, quick responses |
| MiniMax-M2 | Hugging Face | 🚀 Medium | Conversational AI tasks |
| DeepSeek-R1 | Hugging Face | 🤔 Slower | Complex reasoning, detailed analysis |

## 🔑 API Keys

Both API keys are configured in `.env.local`:
- ✅ Gemini API Key: Configured
- ✅ Hugging Face API Key: Configured

**Note**: Keys are stored securely and never exposed to the browser.

## 🎯 Try These Prompts

### General Conversation (Any Model)
- "Explain quantum computing in simple terms"
- "What are the best practices for React development?"
- "Write a haiku about coding"

### Code Generation (Gemini or DeepSeek-R1)
- "Write a Python function to sort a list"
- "Create a REST API endpoint in Node.js"
- "Help me debug this code"

### Complex Reasoning (DeepSeek-R1)
- "Compare and contrast different sorting algorithms"
- "Explain the trade-offs between SQL and NoSQL databases"
- "Design a scalable architecture for a social media app"

### Tables and Data (Any Model)
- "Create a table comparing Next.js and Remix"
- "Show me a markdown table of JavaScript array methods"

## 🎨 UI Elements

### Header
- **Title**: "Chat"
- **Model Dropdown**: Select AI model
- **Clear Button**: Delete conversation history (shows when messages exist)

### Message Bubbles
- **Your Messages**: Right-aligned, blue gradient background
- **AI Messages**: Left-aligned, glassmorphism effect, full width
- **Code Blocks**: Dark theme with syntax highlighting and copy button

### Input Area
- **Text Input**: Type your message
- **Send Button**: Submit message (or press Enter)
- **Stop Button**: Appears during streaming to cancel generation

## 🛠️ Technical Stack

- **Framework**: Next.js 16.0.1
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **AI SDKs**: 
  - LangChain for Gemini
  - Hugging Face Inference for MiniMax-M2 and DeepSeek-R1
- **Markdown**: ReactMarkdown with GitHub Flavored Markdown
- **Syntax Highlighting**: rehype-highlight

## 📝 Keyboard Shortcuts

- **Enter**: Send message
- **Tab**: Navigate through UI elements
- **Esc**: Close confirmation dialogs
- **Ctrl/Cmd + A**: Select all text in input

## 🔧 Troubleshooting

### Server Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Model Not Responding
1. Check `.env.local` file exists with API keys
2. Verify internet connection
3. Check browser console for errors (F12)
4. Check server terminal for error messages

### Dropdown Not Showing
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Restart dev server

### Slow Streaming
- Normal for larger models like DeepSeek-R1
- Check network speed
- Try switching to Gemini for faster responses

## 📚 Documentation

- `MULTI_MODEL_SETUP.md` - Complete setup and technical details
- `HUGGINGFACE_INTEGRATION.md` - Hugging Face integration guide
- `README.md` - Project overview and features
- `DEPLOYMENT_GUIDE.md` - How to deploy to production

## 🎉 You're All Set!

Your multi-model chatbot is ready to use. Open `http://localhost:3000` and start chatting!

### Next Steps
- Try all three models to compare responses
- Test with different types of prompts
- Explore markdown formatting and code generation
- Customize the UI to your preferences

Happy chatting! 🚀
