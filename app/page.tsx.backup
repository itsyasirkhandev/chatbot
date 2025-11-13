'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './components/CodeBlock';
import { ThinkingMessage } from './components/ThinkingMessage';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Header } from './components/Header';
import { Sidebar, Conversation } from './components/Sidebar';
import { FiSend, FiSquare } from 'react-icons/fi';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const CONVERSATIONS_KEY = 'ai-chat-conversations';
const CURRENT_CONVERSATION_KEY = 'ai-chat-current-id';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [provider, setProvider] = useState<'gemini' | 'huggingface' | 'deepseek'>('gemini');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Handle dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load dark mode preference
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      setIsDarkMode(savedDarkMode);
      
      // Apply dark mode class to html element
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newDarkMode));
      
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    announce(newDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
  };

  // Handle sidebar initial state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        // Close sidebar on mobile, keep open on desktop
        setIsSidebarOpen(window.innerWidth >= 1024);
      }
    };

    // Set initial state
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversations from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoadingHistory(true);
      
      // Load all conversations
      const savedConversations = localStorage.getItem(CONVERSATIONS_KEY);
      if (savedConversations) {
        try {
          const parsed = JSON.parse(savedConversations);
          if (parsed.length > 0) {
            setConversations(parsed);
            
            // Load current conversation ID
            const savedCurrentId = localStorage.getItem(CURRENT_CONVERSATION_KEY);
            if (savedCurrentId && parsed.find((c: Conversation) => c.id === savedCurrentId)) {
              setCurrentConversationId(savedCurrentId);
              const currentConv = parsed.find((c: Conversation) => c.id === savedCurrentId);
              if (currentConv) {
                setMessages(currentConv.messages);
              }
            } else {
              // If no current ID or invalid, use the most recent
              const mostRecent = parsed.sort((a: Conversation, b: Conversation) => b.timestamp - a.timestamp)[0];
              setCurrentConversationId(mostRecent.id);
              setMessages(mostRecent.messages);
            }
          } else {
            // Create initial conversation if none exist
            const initialConv: Conversation = {
              id: Date.now().toString(),
              title: 'New Chat',
              messages: [],
              timestamp: Date.now(),
            };
            setConversations([initialConv]);
            setCurrentConversationId(initialConv.id);
          }
        } catch (e) {
          console.error('Failed to load conversations:', e);
          // Create initial conversation on error
          const initialConv: Conversation = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            timestamp: Date.now(),
          };
          setConversations([initialConv]);
          setCurrentConversationId(initialConv.id);
        }
      } else {
        // No saved conversations, create initial one
        const initialConv: Conversation = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [],
          timestamp: Date.now(),
        };
        setConversations([initialConv]);
        setCurrentConversationId(initialConv.id);
      }
      
      setTimeout(() => setIsLoadingHistory(false), 300);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && conversations.length > 0) {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save current conversation ID
  useEffect(() => {
    if (typeof window !== 'undefined' && currentConversationId) {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, currentConversationId);
    }
  }, [currentConversationId]);

  // Update current conversation messages when messages change
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages, timestamp: Date.now() }
            : conv
        )
      );
    }
  }, [messages, currentConversationId]);

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

  // Generate conversation title from first user message
  const generateTitle = (messages: Message[]): string => {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      const content = firstUserMsg.content.trim();
      return content.length > 50 ? content.substring(0, 50) + '...' : content;
    }
    return 'New Chat';
  };

  // Create new conversation
  const handleNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setMessages([]);
    // Close sidebar only on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    announce('New chat started');
    inputRef.current?.focus();
  };

  // Select conversation
  const handleSelectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setCurrentConversationId(id);
      setMessages(conv.messages);
      // Close sidebar only on mobile after selection
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
      announce(`Switched to ${conv.title}`);
    }
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      
      // If deleting current conversation, switch to another or create new
      if (id === currentConversationId) {
        if (updated.length > 0) {
          const mostRecent = updated.sort((a, b) => b.timestamp - a.timestamp)[0];
          setCurrentConversationId(mostRecent.id);
          setMessages(mostRecent.messages);
        } else {
          // No conversations left, create a new one
          const newConv: Conversation = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            timestamp: Date.now(),
          };
          setCurrentConversationId(newConv.id);
          setMessages([]);
          return [newConv];
        }
      }
      
      return updated;
    });
    announce('Conversation deleted');
  };

  // Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
    announce('Conversation renamed');
  };

  // Clear current conversation
  const handleClearConversation = () => {
    if (currentConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages: [], title: 'New Chat', timestamp: Date.now() }
            : conv
        )
      );
      setMessages([]);
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
      
      // Update conversation title if this is the first message
      if (currentConversationId && messages.length === 0) {
        const newMessages = [...messages, userMessage];
        const title = generateTitle(newMessages);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? { ...conv, title }
              : conv
          )
        );
      }
    }
  };

  // Handle suggested prompt click
  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-card to-background">
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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to chat input
      </a>

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content - adjusts based on sidebar state */}
      <div 
        className="flex flex-col h-full transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isSidebarOpen ? '288px' : '0',
          width: isSidebarOpen ? 'calc(100% - 288px)' : '100%'
        }}
      >
        <div className="flex flex-col h-full max-w-5xl w-full mx-auto px-3 py-4 md:px-6 md:py-6">
        <Header
          provider={provider}
          onProviderChange={setProvider}
          systemMessage={systemMessage}
          onSystemPromptClick={() => setShowSystemPrompt(true)}
          messagesCount={messages.length}
          isStreaming={isStreaming}
          onClearClick={() => setShowClearConfirm(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 max-w-sm w-full shadow-xl border border-border" role="dialog" aria-labelledby="clear-dialog-title">
              <h2 id="clear-dialog-title" className="text-lg font-semibold mb-2 text-foreground">
                Clear conversation?
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                This will permanently delete all messages. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearConversation}
                  className="px-4 py-2 text-sm font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-all duration-200 shadow-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Prompt Modal */}
        {showSystemPrompt && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 max-w-lg w-full shadow-xl border border-border" role="dialog" aria-labelledby="system-dialog-title">
              <h2 id="system-dialog-title" className="text-lg font-semibold mb-2 text-foreground">
                System Prompt
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Set custom instructions for how the AI should behave. This will be sent with every message.
              </p>
              <textarea
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                placeholder="You are a helpful assistant that provides concise, accurate answers..."
                className="w-full h-32 px-4 py-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-foreground placeholder-muted-foreground text-sm transition-all duration-200"
              />
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowSystemPrompt(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-all duration-200"
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
                  className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 shadow-sm"
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
          <div className="flex items-start justify-start px-4 pt-8">
            <div className="w-full max-w-4xl">
              <div className="flex justify-start mb-4">
                <div className="max-w-[85%] bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
                  <SkeletonLoader />
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
                  <SkeletonLoader />
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoadingHistory && messages.length === 0 && (
          <div className="flex items-center justify-center h-full px-4">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-10">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Start a conversation
                </h2>
                <p className="text-base text-muted-foreground max-w-sm mx-auto">
                  Ask me anything or choose from suggested prompts below to get started
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left p-4 md:p-5 rounded-lg bg-card border border-border hover:border-primary/40 hover:bg-card/80 hover:shadow-md transition-all duration-200 text-sm text-foreground group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="group-hover:text-primary transition-colors">{prompt}</span>
                    </div>
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
              {/* Message bubble */}
              <div className={`rounded-lg px-4 py-3 md:px-5 md:py-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-shadow'
                  : 'bg-card border border-border hover:border-primary/20 transition-all'
              }`}>
                <div className={`${message.role === 'user' ? 'leading-normal' : 'markdown-content leading-relaxed'} text-sm md:text-base ${
                  message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {message.role === 'assistant' ? (
                    (() => {
                      const isCurrentlyStreaming = isStreaming && index === messages.length - 1;

                      // Only show bouncing dots if message is completely empty and waiting for API response
                      if (message.content === '' && isCurrentlyStreaming) {
                        return <SkeletonLoader />;
                      }

                      const { thinking, response, hasThinkTag } = parseThinkingContent(message.content);

                      // For thinking models: render immediately when any content arrives
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
                      // Show content immediately once it starts arriving
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
          className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-md hover:shadow-lg hover:border-primary/30 transition-all duration-200"
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
              placeholder="Ask me anything..."
              disabled={isStreaming}
              aria-label="Message input"
              aria-required="true"
              aria-describedby="input-hint"
              className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm md:text-base text-foreground placeholder-muted-foreground disabled:opacity-50 font-medium"
            />
            <span id="input-hint" className="sr-only">
              Press Enter to send message
            </span>
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                aria-label="Stop generation"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-sm"
              >
                <FiSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-sm disabled:shadow-none dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
              >
                <FiSend className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            )}
          </div>
        </form>

        {/* Scroll to Bottom Button - Fixed to viewport */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 p-3 bg-card border border-border rounded-full shadow-lg hover:shadow-xl hover:border-primary/40 hover:bg-card/90 transition-all duration-200 z-50 group"
            aria-label="Scroll to bottom"
          >
            <svg
              className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
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
    </div>
  );
}
