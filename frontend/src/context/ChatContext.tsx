import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { chatApi, messageApi, Chat, ChatMessage, userApi, AuthUser } from '@/services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: ChatMessage[];
  loadingChats: boolean;
  loadingMessages: boolean;
  contacts: AuthUser[];
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (content: string, type?: string, replyToId?: string) => Promise<void>;
  sendFile: (file: File, type: string, content?: string, replyToId?: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  markRead: () => Promise<void>;
  sendTyping: (typing: boolean) => void;
  createDirectChat: (userId: string) => Promise<Chat>;
  createGroupChat: (name: string, participantIds: string[]) => Promise<Chat>;
  searchContacts: (q: string) => Promise<AuthUser[]>;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { subscribe, publish } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChatState] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [contacts, setContacts] = useState<AuthUser[]>([]);
  const [messagePage, setMessagePage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  // Load chats on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingChats(true);
    chatApi.list()
      .then(res => setChats(res.data))
      .catch(console.error)
      .finally(() => setLoadingChats(false));
  }, [isAuthenticated]);

  // Global presence subscription
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = subscribe('/topic/presence', (msg) => {
      setChats(prev => prev.map(c => ({
        ...c,
        participants: c.participants.map(p =>
          p.id === msg.userId ? { ...p, status: msg.status || p.status } : p
        ),
      })));
    });
    return unsub;
  }, [isAuthenticated, subscribe]);

  // Subscribe to chat events when activeChat changes
  useEffect(() => {
    if (!activeChat) return;
    const unsub = subscribe(`/topic/chat.${activeChat.id}`, (event) => {
      if (event.type === 'MESSAGE_SENT') {
        const msg = event.payload as ChatMessage;
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setChats(prev => prev.map(c =>
          c.id === activeChat.id ? { ...c, lastMessage: msg } : c
        ));
      } else if (event.type === 'MESSAGE_UPDATED') {
        const updated = event.payload as ChatMessage;
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      } else if (event.type === 'MESSAGE_DELETED') {
        const { messageId } = event.payload as { messageId: string };
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, deleted: true, content: undefined } : m));
      } else if (event.type === 'REACTION_UPDATED') {
        const updated = event.payload as ChatMessage;
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      }
    });
    return unsub;
  }, [activeChat, subscribe]);

  const setActiveChat = useCallback(async (chat: Chat | null) => {
    setActiveChatState(chat);
    setMessages([]);
    setMessagePage(0);
    setHasMoreMessages(false);
    if (!chat) return;
    setLoadingMessages(true);
    try {
      const res = await messageApi.list(chat.id, 0, 50);
      const sorted = [...res.data.content].reverse();
      setMessages(sorted);
      setHasMoreMessages(!res.data.last);
      setMessagePage(1);
      // Mark as read
      await messageApi.markRead(chat.id).catch(() => {});
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!activeChat || !hasMoreMessages || loadingMessages) return;
    setLoadingMessages(true);
    try {
      const res = await messageApi.list(activeChat.id, messagePage, 50);
      const older = [...res.data.content].reverse();
      setMessages(prev => [...older, ...prev]);
      setHasMoreMessages(!res.data.last);
      setMessagePage(p => p + 1);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeChat, hasMoreMessages, loadingMessages, messagePage]);

  const sendMessage = useCallback(async (content: string, type = 'text', replyToId?: string) => {
    if (!activeChat) return;
    const res = await messageApi.send(activeChat.id, { type, content, replyToId });
    // Optimistically add (Kafka consumer will also push it but we deduplicate by id)
    setMessages(prev => {
      if (prev.find(m => m.id === res.data.id)) return prev;
      return [...prev, res.data];
    });
    setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, lastMessage: res.data } : c));
  }, [activeChat]);

  const sendFile = useCallback(async (file: File, type: string, content?: string, replyToId?: string) => {
    if (!activeChat) return;
    const res = await messageApi.sendFile(activeChat.id, file, type, content, replyToId);
    setMessages(prev => {
      if (prev.find(m => m.id === res.data.id)) return prev;
      return [...prev, res.data];
    });
    setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, lastMessage: res.data } : c));
  }, [activeChat]);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    if (!activeChat) return;
    const res = await messageApi.edit(activeChat.id, messageId, content);
    setMessages(prev => prev.map(m => m.id === messageId ? res.data : m));
  }, [activeChat]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!activeChat) return;
    await messageApi.delete(activeChat.id, messageId);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, deleted: true, content: undefined } : m));
  }, [activeChat]);

  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    if (!activeChat) return;
    await messageApi.react(activeChat.id, messageId, emoji);
  }, [activeChat]);

  const markRead = useCallback(async () => {
    if (!activeChat) return;
    await messageApi.markRead(activeChat.id).catch(() => {});
    setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, unreadCount: 0 } : c));
  }, [activeChat]);

  const sendTyping = useCallback((typing: boolean) => {
    if (!activeChat) return;
    publish('/app/chat.typing', { chatId: activeChat.id, typing });
  }, [activeChat, publish]);

  const createDirectChat = useCallback(async (userId: string) => {
    const res = await chatApi.create({ type: 'direct', participantIds: [user!.id, userId] });
    setChats(prev => {
      if (prev.find(c => c.id === res.data.id)) return prev;
      return [res.data, ...prev];
    });
    return res.data;
  }, [user]);

  const createGroupChat = useCallback(async (name: string, participantIds: string[]) => {
    const res = await chatApi.create({ type: 'group', name, participantIds: [user!.id, ...participantIds] });
    setChats(prev => [res.data, ...prev]);
    return res.data;
  }, [user]);

  const searchContacts = useCallback(async (q: string) => {
    if (!q.trim()) return [];
    const res = await userApi.search(q);
    return res.data;
  }, []);

  return (
    <ChatContext.Provider value={{
      chats, activeChat, messages, loadingChats, loadingMessages, contacts,
      setActiveChat, sendMessage, sendFile, editMessage, deleteMessage,
      reactToMessage, markRead, sendTyping, createDirectChat, createGroupChat,
      searchContacts, loadMoreMessages, hasMoreMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
