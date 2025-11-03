'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './components/CodeBlock';
import { ThinkingMessage } from './components/ThinkingMessage';

interface Message {
  role: 'user' | 'assistant' | 'system';
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

/**
 * Versatile thinking detection:
 * Instead of hardcoding which models support thinking,
 * we detect thinking based on content (<think> tags).
 * This makes the system flexible for any model that uses thinking tags.
 */

/**
 * Versatile thinking tag parser
 * Detects and extracts <think> content from any model response
 * Handles complete tags, partial/streaming tags, and variations in format
 * 
 * @param content - Raw message content from the model
 * @returns Object with thinking content, response content, and detection flag
 */
function parseThinkingContent(content: string): { thinking: string; response: string; hasThinkTag: boolean } {
  // Case-insensitive detection to handle variations
  const lowerContent = content.toLowerCase();
  const hasOpenTag = lowerContent.includes('<think>');
  const hasCloseTag = lowerContent.includes('</think>');
  
  if (!hasOpenTag) {
    // No thinking tags present
    return { thinking: '', response: content, hasThinkTag: false };
  }
  
  // Try to match complete thinking block (with case-insensitive flag)
  const completeThinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const completeMatch = content.match(completeThinkRegex);
  
  if (completeMatch) {
    // Complete thinking block found
    const thinking = completeMatch[1].trim();
    const response = content.replace(completeThinkRegex, '').trim();
    
    return {
      thinking,
      response,
      hasThinkTag: true,
    };
  }
  
  // Handle streaming/partial thinking tag
  if (hasOpenTag && !hasCloseTag) {
    const thinkStartIndex = lowerContent.indexOf('<think>');
    const actualStartIndex = content.substring(0, thinkStartIndex + 7).lastIndexOf('<think>') || thinkStartIndex;
    
    // Extract content after <think> tag (still streaming)
    const thinkingContent = content.substring(actualStartIndex + 7).trim();
    
    return {
      thinking: thinkingContent,
      response: '', // No response yet, still thinking
      hasThinkTag: true,
    };
  }
  
  // Edge case: has both tags but regex didn't match (malformed)
  // Treat as non-thinking content
  return { thinking: '', response: content, hasThinkTag: false };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [provider, setProvider] = useState<'gemini' | 'huggingface' | 'deepseek'>('gemini');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Load conversation from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoadingHistory(true);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
        } catch (e) {
          console.error('Failed to load conversation:', e);
        }
      }
      // Small delay to show the loading state
      setTimeout(() => setIsLoadingHistory(false), 300);
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

  // Check if user is at bottom of the page
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;
      
      const container = messagesContainerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      // Show button if user scrolled up more than 100px from bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Check initially
      handleScroll();
      
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]);

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
      // Prepare conversation history with system message if present
      let conversationHistory = [...messages, userMessage];
      
      // Prepend system message if it exists and isn't already in history
      if (systemMessage.trim() && !messages.some(m => m.role === 'system')) {
        conversationHistory = [
          { role: 'system', content: systemMessage.trim() },
          ...conversationHistory
        ];
      }
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory, provider }),
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
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Chat
            </h1>
            <a
              href="/embeding"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
              title="Document Similarity"
            >
              Embeddings
            </a>
          </div>
          <div className="flex items-center gap-3">
            {/* Model Provider Dropdown */}
            <div className="relative">
              <label htmlFor="provider-select" className="sr-only">
                Select AI Provider
              </label>
              <select
                id="provider-select"
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'gemini' | 'huggingface' | 'deepseek')}
                disabled={isStreaming}
                className="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                aria-label="Choose AI model provider"
              >
                <option value="gemini">Gemini</option>
                <option value="huggingface">Hugging Face (MiniMax-M2)</option>
                <option value="deepseek">DeepSeek-R1</option>
              </select>
              <svg 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button
              onClick={() => setShowSystemPrompt(true)}
              className={`p-2 rounded-lg transition-all ${
                systemMessage ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="System prompt"
              title="Set system prompt"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
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
          </div>
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

      {/* System Prompt Modal */}
      {showSystemPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 max-w-lg w-full shadow-2xl" role="dialog" aria-labelledby="system-dialog-title">
            <h2 id="system-dialog-title" className="text-lg font-semibold mb-2 text-gray-900">
              System Prompt
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Set instructions for how the AI should behave. This will be sent with every message.
            </p>
            <textarea
              value={systemMessage}
              onChange={(e) => setSystemMessage(e.target.value)}
              placeholder="You are a helpful assistant that provides concise, accurate answers..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 text-sm"
            />
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setShowSystemPrompt(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSystemPrompt(false);
                  if (systemMessage.trim()) {
                    announce('System prompt set');
                  }
                }}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <main 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-3 md:mb-4 space-y-3 md:space-y-4 relative pr-2 md:pr-3" 
        role="log" 
        aria-label="Chat messages"
        aria-live="polite"
      >
        {/* Loading state when fetching history from localStorage */}
        {isLoadingHistory && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="flex gap-2 justify-center mb-3">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <p className="text-sm text-gray-500">Loading conversation...</p>
            </div>
          </div>
        )}

        {!isLoadingHistory && messages.length === 0 && (
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

        {!isLoadingHistory && messages.map((message, index) => (
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
                <div className={`${message.role === 'user' ? 'leading-normal' : 'markdown-content leading-relaxed'} text-sm md:text-base ${
                  message.role === 'user' ? 'text-white' : 'text-gray-900'
                }`}>
                  {message.role === 'assistant' ? (
                    (() => {
                      const isCurrentlyStreaming = isStreaming && index === messages.length - 1;
                      
                      // Show loading indicator if message is empty and streaming
                      if (message.content === '' && isCurrentlyStreaming) {
                        return (
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} aria-hidden="true"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} aria-hidden="true"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} aria-hidden="true"></span>
                          </div>
                        );
                      }
                      
                      const { thinking, response, hasThinkTag } = parseThinkingContent(message.content);
                      
                      // Versatile thinking detection: Show thinking UI if <think> tags are present
                      // Works for any model, not just hardcoded ones
                      if (hasThinkTag) {
                        return (
                          <ThinkingMessage 
                            thinking={thinking} 
                            response={response}
                            isStreaming={isCurrentlyStreaming}
                          />
                        );
                      }
                      
                      // Standard markdown rendering for non-thinking responses
                      return (
                        <>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
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
                          {isCurrentlyStreaming && (
                            <span 
                              className="inline-block w-1.5 h-4 ml-1 bg-gray-400 animate-pulse"
                              aria-label="Typing indicator"
                            ></span>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <span className="whitespace-pre-wrap block">{message.content}</span>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}

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

      {/* Scroll to Bottom Button - Fixed to viewport */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 p-3 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all z-50 group"
          aria-label="Scroll to bottom"
        >
          <svg 
            className="w-5 h-5 text-gray-600 group-hover:text-gray-900" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
      </div>
    </div>
  );
}
