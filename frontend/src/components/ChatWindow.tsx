import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Chat as MockChat, Message } from '@/data/mockData';
import { MessageBubble } from '@/components/ui/MessageBubble';
import { MessageInput } from '@/components/ui/MessageInput';
import {
  PhoneIcon,
  VideoIcon,
  SearchIcon,
  MoreVerticalIcon,
  PinIcon,
  ArrowLeftIcon,
  Trash2Icon,
  EraserIcon,
  XIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CallType } from '@/components/ui/CallModal';
import { IconButton } from '@/components/ui/IconButton';
import { Dropdown } from '@/components/ui/Dropdown';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { ChatMessage } from '@/services/api';

interface ChatWindowProps {
  chat: MockChat;
  onToggleInfo: () => void;
  onBack?: () => void;
  onStartCall?: (contactName: string, contactAvatar: string, callType: CallType) => void;
  onReplyPrivately?: (senderId: string, quotedMessage: Message) => void;
  onNavigateToMessage?: (chatId: string, messageId: string) => void;
  initialScrollToMessageId?: string;
  initialReplyToMessage?: Message;
}

function apiMsgToMock(m: ChatMessage): Message {
  const attach = m.attachments?.[0];
  return {
    id: m.id,
    senderId: m.sender?.id || '',
    content: m.deleted ? '🚫 This message was deleted' : (m.content || ''),
    timestamp: new Date(m.createdAt),
    type: mapType(m.type),
    status: 'read' as const,
    reactions: m.reactions?.map(r => ({ emoji: r.emoji, userIds: r.userIds })) || [],
    edited: m.edited,
    imageUrl: m.type === 'image' ? attach?.url : undefined,
    videoUrl: m.type === 'video' ? attach?.url : undefined,
    voiceUrl: m.type === 'audio' ? attach?.url : undefined,
    voiceDuration: m.type === 'audio' ? (attach?.duration ?? 0) : undefined,
    fileName: m.type === 'file' ? attach?.fileName : undefined,
    fileSize: m.type === 'file' && attach?.fileSize ? formatBytes(attach.fileSize) : undefined,
    fileUrl: m.type === 'file' ? attach?.url : undefined,
    replyTo: m.replyToId,
    replyToData: m.replyTo ? {
      senderId: m.replyTo.sender?.id || '',
      senderName: m.replyTo.sender?.name || 'Unknown',
      content: m.replyTo.content || '',
    } : undefined,
  };
}

function mapType(t: string): Message['type'] {
  if (t === 'audio') return 'voice';
  if (['text', 'image', 'video', 'file'].includes(t)) return t as Message['type'];
  return 'text';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function ChatWindow({
  chat,
  onToggleInfo,
  onBack,
  onStartCall,
  onReplyPrivately,
  onNavigateToMessage,
  initialScrollToMessageId,
  initialReplyToMessage,
}: ChatWindowProps) {
  const { user: authUser } = useAuth();
  const { messages: apiMessages, sendMessage, editMessage, deleteMessage, reactToMessage, sendTyping, activeChat } = useChat();
  const { subscribe } = useSocket();

  const [replyingTo, setReplyingTo] = useState<Message | undefined>(initialReplyToMessage);
  const [pinnedMessageId, setPinnedMessageId] = useState<string | undefined>(undefined);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Convert API messages to mock type for sub-components
  const messages: Message[] = apiMessages.map(apiMsgToMock);

  // Get participants from the real active chat
  const participants = activeChat?.participants ?? [];
  const currentUserId = authUser?.id || '';

  // Subscribe to typing events for this chat
  useEffect(() => {
    if (!activeChat) return;
    const unsub = subscribe(`/topic/chat.${activeChat.id}`, (event) => {
      if (event.type === 'TYPING') {
        const isTyping = event.typing;
        const uid = event.userId;
        if (uid === currentUserId) return;
        if (isTyping) {
          const p = participants.find(p => p.id === uid);
          setTypingUser(p?.name || 'Someone');
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setTypingUser(null), 4000);
        } else {
          setTypingUser(null);
        }
      }
    });
    return unsub;
  }, [activeChat, subscribe, currentUserId, participants]);

  useEffect(() => {
    setReplyingTo(initialReplyToMessage);
    setPinnedMessageId(undefined);
    setShowSearch(false);
    setSearchQuery('');
    setSearchIndex(0);
    setTypingUser(null);
  }, [chat.id, initialReplyToMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    if (!initialScrollToMessageId) return;
    setTimeout(() => {
      const el = document.getElementById(`message-${initialScrollToMessageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-message');
        setTimeout(() => el.classList.remove('highlight-message'), 2000);
      }
    }, 120);
  }, [messages.length, initialScrollToMessageId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchIndex(0);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = messages
      .filter(m => m.content.toLowerCase().includes(q))
      .map(m => m.id)
      .reverse();
    setSearchResults(results);
    setSearchIndex(0);
    if (results.length > 0) scrollToMessage(results[0]);
  }, [searchQuery]);

  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-message');
      setTimeout(() => el.classList.remove('highlight-message'), 2000);
    }
  }, []);

  const navigateSearch = (direction: 'up' | 'down') => {
    if (searchResults.length === 0) return;
    let newIndex = direction === 'up' ? searchIndex + 1 : searchIndex - 1;
    if (newIndex < 0) newIndex = searchResults.length - 1;
    if (newIndex >= searchResults.length) newIndex = 0;
    setSearchIndex(newIndex);
    scrollToMessage(searchResults[newIndex]);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    await sendMessage(content, 'text', replyingTo?.id);
    setReplyingTo(undefined);
    sendTyping(false);
  };

  const handleSendVoice = async (_duration: number) => {
    // Voice recording requires MediaRecorder integration; placeholder for future
    console.warn('Voice send not yet wired to backend file upload');
  };

  const handleTypingChange = (isTyping: boolean) => {
    sendTyping(isTyping);
  };

  const handleReply = (message: Message) => setReplyingTo(message);

  const handleReplyPrivately = (message: Message) => {
    onReplyPrivately?.(message.senderId, message);
  };

  const handleEdit = async (messageId: string, newContent: string) => {
    await editMessage(messageId, newContent);
  };

  const handleDelete = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  const handleReact = async (messageId: string, emoji: string) => {
    await reactToMessage(messageId, emoji);
  };

  const handlePin = (messageId: string) => {
    setPinnedMessageId(prev => prev === messageId ? undefined : messageId);
  };

  const handleClearHistory = () => {
    // Local UI only — real clear would need an API
  };

  const handleDeleteChat = () => {
    // Would call chatApi.delete() — left as placeholder
  };

  const getOtherUser = () => {
    if (chat.type === 'group') return null;
    const other = participants.find(p => p.id !== currentUserId);
    if (!other) return null;
    return {
      id: other.id,
      name: other.name,
      avatar: other.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other.name}`,
      status: (other.status || 'offline') as 'online' | 'offline',
      lastSeen: undefined as string | undefined,
    };
  };

  const otherUser = getOtherUser();
  const isGroup = chat.type === 'group';

  const handleCall = (type: CallType) => {
    onStartCall?.(chat.name, chat.avatar, type);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateObj.toDateString() === today.toDateString()) return 'Today';
    if (dateObj.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    messages.forEach(message => {
      const messageDate = formatDate(message.timestamp);
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    return groups;
  };

  const pinnedMessage = pinnedMessageId ? messages.find(m => m.id === pinnedMessageId) : undefined;

  // Members list for @mentions in MessageInput
  const membersList = participants.map(p => ({
    id: p.id,
    name: p.name,
    avatar: p.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`,
  }));

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-chat-area dark:bg-chat-area">
      {/* Header */}
      <div className="bg-chat-card dark:bg-chat-card border-b border-chat-border dark:border-chat-border px-3 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {onBack && (
            <IconButton variant="ghost" size="sm" onClick={onBack} className="md:hidden -ml-1">
              <ArrowLeftIcon className="w-5 h-5" />
            </IconButton>
          )}
          <button onClick={onToggleInfo} className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
            <img src={chat.avatar} alt={chat.name} className="w-9 h-9 md:w-10 md:h-10 rounded-full flex-shrink-0" />
            <div className="text-left min-w-0">
              <h2 className="font-semibold text-chat-text dark:text-chat-text text-sm md:text-base truncate">{chat.name}</h2>
              {isGroup ? (
                <p className="text-xs md:text-sm text-chat-muted dark:text-chat-muted">{participants.length} members</p>
              ) : otherUser ? (
                <p className="text-xs md:text-sm text-chat-muted dark:text-chat-muted">
                  {otherUser.status === 'online' ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-chat-online rounded-full" />Online
                    </span>
                  ) : `Last seen recently`}
                </p>
              ) : null}
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <IconButton variant="ghost" size="md" onClick={() => handleCall('voice')} className="hidden md:flex">
            <PhoneIcon className="w-5 h-5" />
          </IconButton>
          <IconButton variant="ghost" size="md" onClick={() => handleCall('video')} className="hidden md:flex">
            <VideoIcon className="w-5 h-5" />
          </IconButton>
          <IconButton
            variant={showSearch ? 'primary' : 'ghost'}
            size="md"
            onClick={() => {
              setShowSearch(!showSearch);
              if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
          >
            <SearchIcon className="w-5 h-5" />
          </IconButton>
          <Dropdown
            trigger={<IconButton variant="ghost" size="md"><MoreVerticalIcon className="w-5 h-5" /></IconButton>}
            items={[
              { id: 'voice-call', label: 'Voice call', icon: PhoneIcon, onClick: () => handleCall('voice') },
              { id: 'video-call', label: 'Video call', icon: VideoIcon, onClick: () => handleCall('video') },
              { id: 'clear-history', label: 'Clear history', icon: EraserIcon, onClick: handleClearHistory },
              { id: 'delete-chat', label: 'Delete chat', icon: Trash2Icon, variant: 'danger', onClick: handleDeleteChat },
            ]}
            width="min-w-[180px]"
            align="right"
          />
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-chat-card dark:bg-chat-card border-b border-chat-border dark:border-chat-border flex-shrink-0 overflow-hidden"
          >
            <div className="px-4 py-2 flex items-center gap-2">
              <SearchIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search in conversation..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-chat-text dark:text-chat-text placeholder-chat-muted"
              />
              {searchResults.length > 0 && (
                <span className="text-xs text-chat-muted dark:text-chat-muted flex-shrink-0">
                  {searchIndex + 1}/{searchResults.length}
                </span>
              )}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <IconButton variant="ghost" size="sm" onClick={() => navigateSearch('up')}><ChevronUpIcon className="w-4 h-4" /></IconButton>
                <IconButton variant="ghost" size="sm" onClick={() => navigateSearch('down')}><ChevronDownIcon className="w-4 h-4" /></IconButton>
                <IconButton variant="ghost" size="sm" onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchIndex(0); }}>
                  <XIcon className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned Message */}
      {pinnedMessage && (
        <button
          onClick={() => scrollToMessage(pinnedMessage.id)}
          className="bg-chat-accent/10 border-b border-chat-accent/20 px-4 md:px-6 py-2 md:py-3 flex items-center gap-2 flex-shrink-0 w-full text-left hover:bg-chat-accent/15 transition-colors"
        >
          <PinIcon className="w-4 h-4 text-chat-accent flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-chat-text dark:text-chat-text truncate">{pinnedMessage.content}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); setPinnedMessageId(undefined); }} className="p-1 hover:bg-chat-accent/20 rounded transition-colors">
            <XIcon className="w-3.5 h-3.5 text-chat-accent" />
          </button>
        </button>
      )}

      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto min-h-0 chat-wallpaper">
        <div className="px-3 md:px-6 py-4">
          {groupMessagesByDate().map((group, groupIdx) => (
            <div key={groupIdx}>
              <div className="flex justify-center my-4">
                <span className="bg-chat-card/90 dark:bg-chat-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-chat-muted dark:text-chat-muted border border-chat-border/50 dark:border-chat-border/50 shadow-sm">
                  {group.date}
                </span>
              </div>
              {group.messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === currentUserId}
                  showSenderName={isGroup}
                  replyToMessage={message.replyTo ? messages.find(m => m.id === message.replyTo) : undefined}
                  currentChatId={chat.id}
                  onReply={handleReply}
                  onReact={handleReact}
                  onPin={handlePin}
                  onScrollToMessage={scrollToMessage}
                  onNavigateToMessage={onNavigateToMessage}
                  isPinned={pinnedMessageId === message.id}
                  isGroupChat={chat.type === 'group'}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReplyPrivately={handleReplyPrivately}
                />
              ))}
            </div>
          ))}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-chat-muted dark:text-chat-muted">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Send a message to start the conversation</p>
            </div>
          )}

          {typingUser && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="bg-chat-card/90 dark:bg-chat-card/90 backdrop-blur-sm px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm">
                <span className="text-sm text-chat-muted dark:text-chat-muted">{typingUser} is typing</span>
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map(delay => (
                    <motion.div
                      key={delay}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                      className="w-1.5 h-1.5 bg-chat-muted dark:bg-chat-muted rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendVoice={handleSendVoice}
        onTypingChange={handleTypingChange}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(undefined)}
        members={membersList}
        isGroupChat={chat.type === 'group'}
      />
    </div>
  );
}
