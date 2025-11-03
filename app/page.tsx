'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [announcement, setAnnouncement] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Screen reader announcement for new messages
  const announce = (text: string) => {
    setAnnouncement(text);
    setTimeout(() => setAnnouncement(''), 100);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsStreaming(true);
    announce('Message sent. Waiting for response.');

    // Add empty assistant message to stream into
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim().startsWith('data:'));

        for (const line of lines) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') break;

          try {
            const { content } = JSON.parse(data);
            setMessages((prev) => {
              const updated = [...prev];
              updated[assistantIndex] = {
                ...updated[assistantIndex],
                content: updated[assistantIndex].content + content,
              };
              return updated;
            });
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        };
        return updated;
      });
      announce('Error: Unable to get response.');
    } finally {
      setIsStreaming(false);
      announce('Response complete.');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 md:p-6">
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Skip to main content link for keyboard users */}
      <a 
        href="#chat-input" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg"
      >
        Skip to chat input
      </a>

      {/* Header */}
      <header className="glass-elevated rounded-2xl p-6 mb-4 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-bricolage)] bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          AI Chatbot
        </h1>
        <p className="text-slate-300 mt-2">Ask me anything</p>
      </header>

      {/* Messages Container */}
      <main 
        className="flex-1 overflow-y-auto mb-4 space-y-4" 
        role="log" 
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="glass-surface rounded-2xl p-8 max-w-md text-center">
              <h2 className="text-2xl font-semibold font-[var(--font-bricolage)] mb-3">
                Welcome! 👋
              </h2>
              <p className="text-slate-300">
                Start a conversation by typing a message below. I'm here to help with any questions you have!
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <article
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            role="article"
            aria-label={`${message.role === 'user' ? 'Your message' : 'Assistant message'}`}
          >
            <div
              className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  : 'glass-surface'
              }`}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/10"
                  aria-hidden="true"
                >
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium mb-1 opacity-80">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </p>
                  <div className="markdown-content leading-relaxed">
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    {message.role === 'assistant' && isStreaming && index === messages.length - 1 && (
                      <span 
                        className="inline-block w-2 h-4 ml-1 bg-slate-400 animate-pulse"
                        aria-label="Typing indicator"
                      ></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start" role="status" aria-label="Assistant is typing">
            <div className="glass-surface rounded-2xl p-4 shadow-lg">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} aria-hidden="true"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} aria-hidden="true"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} aria-hidden="true"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <form 
        onSubmit={handleSubmit} 
        className="glass-elevated rounded-2xl p-4 shadow-lg"
        aria-label="Chat input form"
      >
        <div className="flex gap-3">
          <label htmlFor="chat-input" className="sr-only">
            Type your message
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isStreaming}
            aria-label="Message input"
            aria-required="true"
            aria-describedby="input-hint"
            className="flex-1 bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span id="input-hint" className="sr-only">
            Press Enter to send message
          </span>
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            aria-label={isStreaming ? 'Sending message' : 'Send message'}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {isStreaming ? (
              <span className="flex items-center gap-2">
                <svg 
                  className="animate-spin h-5 w-5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="sr-only">Sending</span>
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
