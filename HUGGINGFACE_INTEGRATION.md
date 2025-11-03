# Hugging Face Integration

## Overview
The chatbot now supports both Google Gemini and Hugging Face models with a dropdown selector in the UI.

## Models Available
1. **Gemini** (Google) - `gemini-2.5-flash`
2. **Hugging Face** - `MiniMaxAI/MiniMax-M2`
3. **DeepSeek-R1** - `deepseek-ai/DeepSeek-R1`

## Changes Made

### 1. Environment Variables
Added to `.env.local`:
```
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

**Note**: Replace `your_huggingface_api_key_here` with your actual Hugging Face API key.

### 2. Dependencies
Installed Hugging Face Inference SDK:
```bash
npm install @huggingface/inference
```

### 3. API Route Updates (`app/api/chat/route.ts`)
- Added support for both providers via `provider` parameter in request body
- Implemented Hugging Face streaming using `HfInference.textGenerationStream()`
- Formatted messages appropriately for each provider:
  - **Gemini**: Uses LangChain message format (HumanMessage/AIMessage)
  - **Hugging Face**: Uses simple User/Assistant format in plain text

### 4. Frontend Updates (`app/page.tsx`)
- Added `provider` state: `useState<'gemini' | 'huggingface'>('gemini')`
- Added dropdown selector in header to switch between providers
- Dropdown includes:
  - Glass-style design matching the UI aesthetic
  - Disabled state when streaming
  - Accessibility labels
  - Custom arrow icon
- Provider selection sent with each API request

## UI Changes

### Header Section
```tsx
<select
  value={provider}
  onChange={(e) => setProvider(e.target.value as 'gemini' | 'huggingface')}
  disabled={isStreaming}
>
  <option value="gemini">Gemini</option>
  <option value="huggingface">Hugging Face (MiniMax-M2)</option>
</select>
```

The dropdown:
- Positioned in the header next to the clear button
- Styled to match the minimalist design
- Disabled during message streaming
- Includes proper ARIA labels for accessibility

## How to Use

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the app**: Navigate to `http://localhost:3000`

3. **Select a provider**: Use the dropdown in the header to choose between:
   - Gemini (default)
   - Hugging Face (MiniMax-M2)
   - DeepSeek-R1

4. **Start chatting**: Type your message and send. The selected model will generate the response.

## Technical Details

### Hugging Face Implementation
```typescript
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Model selection based on provider
const modelId = provider === 'deepseek' 
  ? 'deepseek-ai/DeepSeek-R1' 
  : 'MiniMaxAI/MiniMax-M2';

const stream = hf.chatCompletionStream({
  model: modelId,
  messages: messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  })),
  max_tokens: 2048,
  temperature: 0.7,
  top_p: 0.95,
});
```

**Note**: Both MiniMax-M2 and DeepSeek-R1 are conversational models that use the chat completion API, not text generation.

### Request Format
```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" }
  ],
  "provider": "huggingface"
}
```

Or for DeepSeek-R1:
```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "provider": "deepseek"
}
```

### Streaming Response
Both providers return Server-Sent Events (SSE) format:
```
data: {"content":"token"}
data: {"content":" next"}
data: [DONE]
```

## Security Notes
- API keys are stored in `.env.local` and not committed to version control
- Keys are accessed via `process.env` on the server side only
- Never exposed to the client

## Future Enhancements
- Add more Hugging Face models to the dropdown
- Persist provider selection in localStorage
- Add model-specific parameters UI
- Show model information/capabilities in the UI
