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

  // Load conversation from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch (e) {
        console.error('Failed to load conversation:', e);
      }
    }
  }, []);

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
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
    localStorage.removeItem(STORAGE_KEY);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-bricolage)] bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              AI Chatbot
            </h1>
            <p className="text-slate-300 mt-2">Ask me anything</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white glass-surface hover:bg-white/10 rounded-xl transition-all flex items-center gap-2"
              aria-label="Clear conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-elevated rounded-2xl p-6 max-w-md w-full shadow-2xl" role="dialog" aria-labelledby="clear-dialog-title">
            <h2 id="clear-dialog-title" className="text-xl font-semibold font-[var(--font-bricolage)] mb-2">
              Clear Conversation?
            </h2>
            <p className="text-slate-300 mb-6">
              This will delete all messages in the current conversation. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white glass-surface hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClearConversation}
                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all"
              >
                Clear Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <main 
        className="flex-1 overflow-y-auto mb-4 space-y-4" 
        role="log" 
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-2xl w-full px-4">
              <div className="glass-surface rounded-2xl p-8 text-center mb-6">
                <h2 className="text-2xl font-semibold font-[var(--font-bricolage)] mb-3">
                  Welcome! 👋
                </h2>
                <p className="text-slate-300">
                  Start a conversation by typing a message below or try one of these suggestions:
                </p>
              </div>
              
              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="glass-surface hover:glass-elevated rounded-xl p-4 text-left transition-all hover:scale-[1.02] group"
                  >
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                        {prompt}
                      </span>
                    </div>
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
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const codeString = String(children).replace(/\n$/, '');
                            
                            if (inline) {
                              return <code className={className} {...props}>{children}</code>;
                            }
                            
                            return (
                              <CodeBlock className={className}>
                                {codeString}
                              </CodeBlock>
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
          {isStreaming ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              aria-label="Stop generation"
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
