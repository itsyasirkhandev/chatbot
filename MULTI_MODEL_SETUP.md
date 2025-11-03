# Multi-Model Chat Setup

## Overview
The chatbot now supports three AI models with a dropdown selector in the interface:
- **Gemini** (Google) - `gemini-2.5-flash`
- **Hugging Face MiniMax-M2** - `MiniMaxAI/MiniMax-M2`
- **DeepSeek-R1** - `deepseek-ai/DeepSeek-R1`

## Setup Complete

### 1. Environment Configuration
The `.env.local` file contains both API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

**Note**: Replace the placeholder values with your actual API keys.

### 2. Dependencies Installed
```bash
npm install @huggingface/inference
```

### 3. Backend Implementation (`app/api/chat/route.ts`)
- Added support for three providers via the `provider` parameter
- **Gemini**: Uses LangChain's ChatGoogleGenerativeAI
- **Hugging Face & DeepSeek**: Uses HfInference with chatCompletionStream
- Dynamic model selection:
  ```typescript
  const modelId = provider === 'deepseek' 
    ? 'deepseek-ai/DeepSeek-R1' 
    : 'MiniMaxAI/MiniMax-M2';
  ```

### 4. Frontend Implementation (`app/page.tsx`)
- Added provider state: `useState<'gemini' | 'huggingface' | 'deepseek'>('gemini')`
- Dropdown in header with three options:
  - Gemini (default)
  - Hugging Face (MiniMax-M2)
  - DeepSeek-R1
- Dropdown is disabled during streaming
- Provider selection persists for the session

## UI Design

### Dropdown Selector
Located in the header, styled to match the minimalist design:
```tsx
<select
  id="provider-select"
  value={provider}
  onChange={(e) => setProvider(e.target.value as 'gemini' | 'huggingface' | 'deepseek')}
  disabled={isStreaming}
  className="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg bg-white text-gray-700..."
>
  <option value="gemini">Gemini</option>
  <option value="huggingface">Hugging Face (MiniMax-M2)</option>
  <option value="deepseek">DeepSeek-R1</option>
</select>
```

### Features
- Clean, minimal design matching the existing UI
- Custom dropdown arrow icon
- Hover and focus states
- Disabled state during streaming
- Screen reader accessible with ARIA labels

## Usage

### Running the App
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser to `http://localhost:3000`

3. Select a model from the dropdown in the header

4. Type your message and send

### Model Selection
- **Gemini**: Fast responses, good for general conversation
- **MiniMax-M2**: Specialized conversational model from MiniMax AI
- **DeepSeek-R1**: Advanced reasoning model from DeepSeek

## API Details

### Request Format
```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi!" },
    { "role": "user", "content": "How are you?" }
  ],
  "provider": "deepseek"
}
```

### Response Format
All models return Server-Sent Events (SSE):
```
data: {"content":"Hello"}
data: {"content":" there"}
data: {"content":"!"}
data: [DONE]
```

### Provider-Specific Implementation

#### Gemini
- Uses LangChain's streaming API
- Converts messages to HumanMessage/AIMessage format
- Supports full conversation history

#### Hugging Face Models (MiniMax-M2 & DeepSeek-R1)
- Uses Hugging Face Inference API
- Chat completion endpoint with streaming
- Parameters:
  - `max_tokens`: 2048
  - `temperature`: 0.7
  - `top_p`: 0.95

## File Changes

### Modified Files
1. `.env.local` - Added HUGGINGFACE_API_KEY
2. `app/api/chat/route.ts` - Added multi-provider support
3. `app/page.tsx` - Added provider state and dropdown UI
4. `package.json` - Added @huggingface/inference dependency

### New Documentation
1. `HUGGINGFACE_INTEGRATION.md` - Detailed integration guide
2. `MULTI_MODEL_SETUP.md` - This file

## Testing

The application has been tested and is running successfully:
- ✅ Gemini model working
- ✅ MiniMax-M2 integration complete
- ✅ DeepSeek-R1 integration complete
- ✅ Dropdown selector functional
- ✅ Streaming responses working
- ✅ UI responsive and accessible

## Next Steps (Optional Enhancements)

1. **Persist Selection**: Save provider choice to localStorage
2. **Model Info**: Add tooltips showing model capabilities
3. **Custom Parameters**: Allow users to adjust temperature/max_tokens
4. **Model Comparison**: Side-by-side comparison mode
5. **More Models**: Add additional Hugging Face models
6. **Usage Tracking**: Track tokens/costs per model

## Troubleshooting

### Model Not Responding
- Check API keys in `.env.local`
- Verify Hugging Face model is accessible
- Check browser console for errors
- Check server terminal for API errors

### Dropdown Not Working
- Clear browser cache
- Restart development server
- Check for JavaScript errors in console

### Slow Response
- Some models may be slower than others
- DeepSeek-R1 is a large model and may take longer
- Network latency may affect streaming speed
