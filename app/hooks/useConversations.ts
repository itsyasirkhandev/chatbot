import { useEffect, useState } from 'react';
import { Conversation, Message } from '../types';
import { CONVERSATIONS_KEY, CURRENT_CONVERSATION_KEY, generateTitle } from '../utils/chat';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Load conversations from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoadingHistory(true);
      
      const savedConversations = localStorage.getItem(CONVERSATIONS_KEY);
      if (savedConversations) {
        try {
          const parsed = JSON.parse(savedConversations);
          if (parsed.length > 0) {
            setConversations(parsed);
            
            const savedCurrentId = localStorage.getItem(CURRENT_CONVERSATION_KEY);
            if (savedCurrentId && parsed.find((c: Conversation) => c.id === savedCurrentId)) {
              setCurrentConversationId(savedCurrentId);
              const currentConv = parsed.find((c: Conversation) => c.id === savedCurrentId);
              if (currentConv) {
                setMessages(currentConv.messages);
              }
            } else {
              const mostRecent = parsed.sort((a: Conversation, b: Conversation) => b.timestamp - a.timestamp)[0];
              setCurrentConversationId(mostRecent.id);
              setMessages(mostRecent.messages);
            }
          } else {
            createInitialConversation();
          }
        } catch (e) {
          console.error('Failed to load conversations:', e);
          createInitialConversation();
        }
      } else {
        createInitialConversation();
      }
      
      setTimeout(() => setIsLoadingHistory(false), 300);
    }
  }, []);

  const createInitialConversation = () => {
    const initialConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: Date.now(),
    };
    setConversations([initialConv]);
    setCurrentConversationId(initialConv.id);
  };

  // Save conversations to localStorage
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

  // Update current conversation messages
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

  const createNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setMessages([]);
  };

  const selectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setCurrentConversationId(id);
      setMessages(conv.messages);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      
      if (id === currentConversationId) {
        if (updated.length > 0) {
          const mostRecent = updated.sort((a, b) => b.timestamp - a.timestamp)[0];
          setCurrentConversationId(mostRecent.id);
          setMessages(mostRecent.messages);
        } else {
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
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  const clearConversation = () => {
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
  };

  const updateTitle = () => {
    if (currentConversationId && messages.length > 0) {
      const title = generateTitle(messages);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, title }
            : conv
        )
      );
    }
  };

  return {
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
  };
}
