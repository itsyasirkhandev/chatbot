'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Provider } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { ClearConfirmModal } from './components/ClearConfirmModal';
import { SystemPromptModal } from './components/SystemPromptModal';
import { useDarkMode } from './hooks/useDarkMode';
import { useConversations } from './hooks/useConversations';
import { useScrollToBottom } from './hooks/useScrollToBottom';
import { useAnnouncements } from './hooks/useAnnouncements';

export default function Home() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setProvider] = useState<Provider>('gemini');
  const [providerLocked, setProviderLocked] = useState(false);
  const [systemMessage, setSystemMessage] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const {
    conversations,
    currentConversationId,
    messages,
    setMessages,
    isLoadingHistory,
    createNewChat,
    selectConversation,
    deleteConversation,
    renameConversation,
    clearConversation,
    updateTitle,
  } = useConversations();

  const { containerRef, endRef, showScrollButton, scrollToBottom } = useScrollToBottom([messages.length]);
  const { announcement, announce } = useAnnouncements();

  // Handle sidebar responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsSidebarOpen(window.innerWidth >= 1024);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleDarkMode = () => {
    const message = toggleDarkMode();
    announce(message);
  };

  const handleNewChat = () => {
    createNewChat();
    setProviderLocked(false);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    announce('New chat started');
    inputRef.current?.focus();
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    const conv = conversations.find((c) => c.id === id);
    // Lock provider if this conversation already has messages; unlock if empty
    if (conv) {
      setProviderLocked(conv.messages.length > 0);
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    announce(`Switched to ${conv?.title || 'conversation'}`);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    announce('Conversation deleted');
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    renameConversation(id, newTitle);
    announce('Conversation renamed');
  };

  const handleClearConversation = () => {
    clearConversation();
    setShowClearConfirm(false);
    announce('Conversation cleared');
    inputRef.current?.focus();
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      announce('Generation stopped');
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: FormEvent, promptText?: string) => {
    e.preventDefault();
    const messageText = promptText || input;
    if (!messageText.trim() || isStreaming) return;

    const userMessage = { role: 'user' as const, content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    announce('Message sent. Waiting for response.');

    // Add empty assistant message
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      let conversationHistory = [...messages, userMessage];

      if (systemMessage.trim() && !messages.some((m) => m.role === 'system')) {
        conversationHistory = [
          { role: 'system', content: systemMessage.trim() },
          ...conversationHistory,
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
      if (error.name === 'AbortError') {
        console.log('Request aborted by user');
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

      if (messages.length === 0) {
        updateTitle();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Skip to chat input link */}
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

      {/* Main Content */}
      <div
        className="flex flex-col h-full transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isSidebarOpen ? '288px' : '0',
          width: isSidebarOpen ? 'calc(100% - 288px)' : '100%',
        }}
      >
        <div className="flex flex-col h-full max-w-5xl w-full mx-auto px-3 py-4 md:px-6 md:py-6">
          <Header
            provider={provider}
            onProviderChange={(p) => {
              // Lock model selection immediately upon first selection for this chat
              if (messages.length === 0 && !providerLocked) {
                setProvider(p);
                setProviderLocked(true);
              }
            }}
            systemMessage={systemMessage}
            onSystemPromptClick={() => setShowSystemPrompt(true)}
            messagesCount={messages.length}
            isStreaming={isStreaming}
            onClearClick={() => setShowClearConfirm(true)}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            isProviderLocked={providerLocked}
          />

          {/* Modals */}
          {showClearConfirm && (
            <ClearConfirmModal
              onConfirm={handleClearConversation}
              onCancel={() => setShowClearConfirm(false)}
            />
          )}

          {showSystemPrompt && (
            <SystemPromptModal
              value={systemMessage}
              onChange={setSystemMessage}
              onSave={() => {
                setShowSystemPrompt(false);
                if (systemMessage.trim()) {
                  announce('System prompt set');
                }
              }}
              onCancel={() => setShowSystemPrompt(false)}
            />
          )}

          {/* Messages */}
          <MessageList
            ref={containerRef}
            messages={messages}
            isStreaming={isStreaming}
            isLoadingHistory={isLoadingHistory}
            onPromptClick={handlePromptClick}
          />
          <div ref={endRef} />

          {/* Input */}
          <ChatInput
            ref={inputRef}
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onStop={handleStopGeneration}
            isStreaming={isStreaming}
            showScrollButton={showScrollButton}
            onScrollToBottom={scrollToBottom}
          />
        </div>
      </div>
    </div>
  );
}
