import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { HfInference } from '@huggingface/inference';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages, provider = 'gemini' } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages array is required', { status: 400 });
    }

    const encoder = new TextEncoder();

    if (provider === 'huggingface' || provider === 'deepseek') {
      // Hugging Face implementation (supports both MiniMax-M2 and DeepSeek-R1)
      const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

      // Select model based on provider
      const modelId = provider === 'deepseek' 
        ? 'deepseek-ai/DeepSeek-R1' 
        : 'MiniMaxAI/MiniMax-M2';

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const stream = hf.chatCompletionStream({
              model: modelId,
              messages: messages.map((msg: { role: string; content: string }) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content,
              })),
              max_tokens: 2048,
              temperature: 0.7,
              top_p: 0.95,
            });

            for await (const chunk of stream) {
              if (chunk.choices && chunk.choices[0]?.delta?.content) {
                const content = chunk.choices[0].delta.content;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
              }
            }

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('Hugging Face stream error:', error);
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Gemini implementation (default)
      const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-2.5-flash',
        streaming: true,
      });

      // Convert messages to LangChain message format
      const formattedMessages = messages.map((msg: { role: string; content: string }) => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      const stream = await model.stream(formattedMessages);

      // Convert LangChain stream to ReadableStream for SSE
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.content;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('Stream error:', error);
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
