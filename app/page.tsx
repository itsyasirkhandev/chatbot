'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './components/CodeBlock';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'gemini-chat-history';

const SUGGESTED_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list",
  "What are the best practices for React development?",
  "Create a table comparing Next.js and Remix",
  "Help me debug this code",
  "Write a haiku about coding",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Load conversation from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
        } catch (e) {
          console.error('Failed to load conversation:', e);
        }
      }
    }
  }, []);

  // Save conversation to localStorage whenever messages change (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

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

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setShowClearConfirm(false);
    announce('Conversation cleared');
    inputRef.current?.focus();
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      announce('Generation stopped');
    }
  };

  const handleSubmit = async (e: FormEvent, promptText?: string) => {
    e.preventDefault();
    const messageText = promptText || input;
    if (!messageText.trim() || isStreaming) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    announce('Message sent. Waiting for response.');

    // Add empty assistant message to stream into
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Send full conversation history for context
      const conversationHistory = [...messages, userMessage];
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
        signal: abortController.signal,
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
    } catch (error: any) {
      // Don't show error if request was aborted by user
      if (error.name === 'AbortError') {
        console.log('Request aborted by user');
        // Remove the empty assistant message
        setMessages((prev) => prev.slice(0, -1));
      } else {
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
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      announce('Response complete.');
      inputRef.current?.focus();
    }
  };

  // Handle suggested prompt click
  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen">
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

      <div className="flex flex-col h-full max-w-4xl w-full mx-auto px-3 py-4 md:px-6 md:py-6">
        {/* Minimal Header */}
        <header className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Chat
          </h1>
          {messages.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </header>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-2xl" role="dialog" aria-labelledby="clear-dialog-title">
            <h2 id="clear-dialog-title" className="text-lg font-semibold mb-2 text-gray-900">
              Clear conversation?
            </h2>
            <p className="text-gray-600 text-sm mb-5">
              This will delete all messages. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClearConversation}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <main 
        className="flex-1 overflow-y-auto mb-3 md:mb-4 space-y-3 md:space-y-4" 
        role="log" 
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full px-4">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">💬</div>
                <h2 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                  How can I help you today?
                </h2>
                <p className="text-sm text-gray-600">
                  Ask me anything or try a suggestion below
                </p>
              </div>
              
              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left p-3 md:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all text-sm text-gray-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
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
              className={`${
                message.role === 'user' 
                  ? 'max-w-[90%] sm:max-w-[85%] md:max-w-[80%]' 
                  : 'w-full'
              }`}
            >
              {/* Label */}
              <div className={`text-xs font-medium mb-1.5 ${
                message.role === 'user' ? 'text-right text-gray-600' : 'text-left text-gray-600'
              }`}>
                {message.role === 'user' ? 'User' : 'AI Assistant'}
              </div>
              
              {/* Message bubble */}
              <div className={`rounded-xl px-4 py-3 md:px-5 md:py-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`markdown-content leading-relaxed text-sm md:text-base ${
                  message.role === 'user' ? 'text-white' : 'text-gray-900'
                }`}>
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          // Only use full CodeBlock component for:
                          // 1. Block code (not inline)
                          // 2. Code with language specification (className like "language-js")
                          if (!inline && className) {
                            return (
                              <CodeBlock 
                                className={className} 
                                inline={false}
                              >
                                {children}
                              </CodeBlock>
                            );
                          }
                          
                          // For inline code (in text, tables, etc), use simple inline style
                          return (
                            <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-[0.9em] font-mono">
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  {message.role === 'assistant' && isStreaming && index === messages.length - 1 && (
                    <span 
                      className="inline-block w-1.5 h-4 ml-1 bg-gray-400 animate-pulse"
                      aria-label="Typing indicator"
                    ></span>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start" role="status" aria-label="Assistant is typing">
            <div>
              <div className="text-xs font-medium mb-1.5 text-left text-gray-600">
                AI Assistant
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} aria-hidden="true"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} aria-hidden="true"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} aria-hidden="true"></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm"
        aria-label="Chat input form"
      >
        <div className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Type your message
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            disabled={isStreaming}
            aria-label="Message input"
            aria-required="true"
            aria-describedby="input-hint"
            className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm md:text-base text-gray-900 placeholder-gray-400 disabled:opacity-50"
          />
          <span id="input-hint" className="sr-only">
            Press Enter to send message
          </span>
          {isStreaming ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              aria-label="Stop generation"
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all flex items-center gap-1.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:inline">Send</span>
            </button>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}
