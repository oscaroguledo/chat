import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Chat, Message, users, currentUser } from '@/data/mockData';
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
  ChevronDownIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CallType } from '@/components/ui/CallModal';
import { IconButton } from '@/components/ui/IconButton';
import { Dropdown } from '@/components/ui/Dropdown';
interface ChatWindowProps {
  chat: Chat;
  onToggleInfo: () => void;
  onBack?: () => void;
  onStartCall?: (
  contactName: string,
  contactAvatar: string,
  callType: CallType)
  => void;
  onReplyPrivately?: (senderId: string, quotedMessage: Message) => void;
  onNavigateToMessage?: (chatId: string, messageId: string) => void;
  initialScrollToMessageId?: string;
  initialReplyToMessage?: Message;
}
export function ChatWindow({
  chat,
  onToggleInfo,
  onBack,
  onStartCall,
  onReplyPrivately,
  onNavigateToMessage,
  initialScrollToMessageId,
  initialReplyToMessage
}: ChatWindowProps) {
  const [messages, setMessages] = useState(chat.messages);
  const [replyingTo, setReplyingTo] = useState<Message | undefined>();
  const [pinnedMessageId, setPinnedMessageId] = useState<string | undefined>(
    chat.pinnedMessageId
  );
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setMessages(chat.messages);
    setReplyingTo(initialReplyToMessage);
    setPinnedMessageId(chat.pinnedMessageId);
    setShowSearch(false);
    setSearchQuery('');
    setSearchIndex(0);
  }, [chat, initialReplyToMessage]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to a specific message when requested (e.g., after replying privately)
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
  }, [messages, initialScrollToMessageId]);
  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchIndex(0);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = messages.
    filter((m) => m.content.toLowerCase().includes(q)).
    map((m) => m.id).
    reverse();
    setSearchResults(results);
    setSearchIndex(0);
    if (results.length > 0) scrollToMessage(results[0]);
  }, [searchQuery]);
  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
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
  const handleSendMessage = (content: string, mentions?: string[]) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      type: 'text',
      content,
      timestamp: new Date(),
      status: 'sent',
      replyTo: replyingTo?.id,
      replyToChatId: replyingTo?.id ? chat.id : undefined, // Store which chat the replied message is from
      replyToData: replyingTo ? { // Store snapshot of quoted message for display
        senderId: replyingTo.senderId,
        senderName: users[replyingTo.senderId]?.name || 'Unknown',
        content: replyingTo.content
      } : undefined,
      mentions
    };
    setMessages([...messages, newMessage]);
    setReplyingTo(undefined);
    setTimeout(() => {
      setMessages((prev) =>
      prev.map((m) =>
      m.id === newMessage.id ?
      {
        ...m,
        status: 'delivered' as const
      } :
      m
      )
      );
    }, 1000);
    setTimeout(() => {
      setMessages((prev) =>
      prev.map((m) =>
      m.id === newMessage.id ?
      {
        ...m,
        status: 'read' as const
      } :
      m
      )
      );
    }, 2000);
  };
  const handleSendVoice = (duration: number) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      content: 'Voice message',
      timestamp: new Date(),
      type: 'voice',
      status: 'sent',
      voiceDuration: duration,
      voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    };
    setMessages([...messages, newMessage]);
  };
  const handleReply = (message: Message) => setReplyingTo(message);
  
  const handleReplyPrivately = (message: Message) => {
    if (onReplyPrivately) {
      onReplyPrivately(message.senderId, message);
    }
  };
  
  const handleEdit = (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, content: newContent, edited: true } : m
      )
    );
  };
  
  const handleDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };
  
  const handleReact = (messageId: string, emoji: string) => {
    setMessages((prev) =>
    prev.map((m) => {
      if (m.id !== messageId) return m;
      const existingReactions = m.reactions ? [...m.reactions] : [];
      const existingReaction = existingReactions.find(
        (r) => r.emoji === emoji
      );
      if (existingReaction) {
        if (existingReaction.userIds.includes(currentUser.id)) {
          existingReaction.userIds = existingReaction.userIds.filter(
            (id) => id !== currentUser.id
          );
          const filtered = existingReactions.filter(
            (r) => r.userIds.length > 0
          );
          return {
            ...m,
            reactions: filtered.length > 0 ? filtered : undefined
          };
        } else {
          existingReaction.userIds = [
          ...existingReaction.userIds,
          currentUser.id];

          return {
            ...m,
            reactions: existingReactions
          };
        }
      } else {
        return {
          ...m,
          reactions: [
          ...existingReactions,
          {
            emoji,
            userIds: [currentUser.id]
          }]

        };
      }
    })
    );
  };
  const handlePin = (messageId: string) => {
    setPinnedMessageId((prev) => prev === messageId ? undefined : messageId);
  };
  const handleClearHistory = () => {
    setMessages([]);
  };
  const handleDeleteChat = () => {
    setMessages([]);
  };
  const getOtherUser = () => {
    if (chat.type === 'group') return null;
    const otherUserId = chat.participants.find((id) => id !== currentUser.id);
    return otherUserId ? users[otherUserId] : null;
  };
  const otherUser = getOtherUser();
  const isGroup = chat.type === 'group';
  const handleCall = (type: CallType) => {
    if (onStartCall) onStartCall(chat.name, chat.avatar, type);
  };
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const groupMessagesByDate = () => {
    const groups: {
      date: string;
      messages: Message[];
    }[] = [];
    let currentDate = '';
    messages.forEach((message) => {
      const messageDate = formatDate(message.timestamp);
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({
          date: messageDate,
          messages: [message]
        });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    return groups;
  };
  const pinnedMessage = pinnedMessageId ?
  messages.find((m) => m.id === pinnedMessageId) :
  undefined;
  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-chat-area dark:bg-chat-area">
      {/* Header */}
      <div className="bg-chat-card dark:bg-chat-card border-b border-chat-border dark:border-chat-border px-3 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {onBack &&
          <IconButton variant="ghost" size="sm" onClick={onBack} className="md:hidden -ml-1">
            <ArrowLeftIcon className="w-5 h-5" />
          </IconButton>
          }
          <button
            onClick={onToggleInfo}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
            
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex-shrink-0" />
            
            <div className="text-left min-w-0">
              <h2 className="font-semibold text-chat-text dark:text-chat-text text-sm md:text-base truncate">
                {chat.name}
              </h2>
              {isGroup ?
              <p className="text-xs md:text-sm text-chat-muted dark:text-chat-muted">
                  {chat.participants.length} members
                </p> :
              otherUser ?
              <p className="text-xs md:text-sm text-chat-muted dark:text-chat-muted">
                  {otherUser.status === 'online' ?
                <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-chat-online rounded-full" />
                      Online
                    </span> :

                `Last seen ${otherUser.lastSeen}`
                }
                </p> :
              null}
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <IconButton
            variant="ghost"
            size="md"
            onClick={() => handleCall('voice')}
            className="hidden md:flex">
            <PhoneIcon className="w-5 h-5" />
          </IconButton>
          <IconButton
            variant="ghost"
            size="md"
            onClick={() => handleCall('video')}
            className="hidden md:flex">
            <VideoIcon className="w-5 h-5" />
          </IconButton>
          <IconButton
            variant={showSearch ? 'primary' : 'ghost'}
            size="md"
            onClick={() => {
              setShowSearch(!showSearch);
              if (!showSearch)
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}>
            <SearchIcon className="w-5 h-5" />
          </IconButton>
          <Dropdown
            trigger={
              <IconButton
                variant="ghost"
                size="md">
                <MoreVerticalIcon className="w-5 h-5" />
              </IconButton>
            }
            items={[
              {
                id: 'voice-call',
                label: 'Voice call',
                icon: PhoneIcon,
                onClick: () => handleCall('voice')
              },
              {
                id: 'video-call',
                label: 'Video call',
                icon: VideoIcon,
                onClick: () => handleCall('video')
              },
              {
                id: 'clear-history',
                label: 'Clear history',
                icon: EraserIcon,
                onClick: handleClearHistory
              },
              {
                id: 'delete-chat',
                label: 'Delete chat',
                icon: Trash2Icon,
                variant: 'danger',
                onClick: handleDeleteChat
              }
            ]}
            width="min-w-[180px]"
            align="right"
          />
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch &&
        <motion.div
          initial={{
            height: 0,
            opacity: 0
          }}
          animate={{
            height: 'auto',
            opacity: 1
          }}
          exit={{
            height: 0,
            opacity: 0
          }}
          className="bg-chat-card dark:bg-chat-card border-b border-chat-border dark:border-chat-border flex-shrink-0 overflow-hidden">
          
            <div className="px-4 py-2 flex items-center gap-2">
                <SearchIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted flex-shrink-0" />
                <input
                ref={searchInputRef}
                type="text"
                placeholder="Search in conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-chat-text dark:text-chat-text placeholder-chat-muted" />
              
                {searchResults.length > 0 &&
              <span className="text-xs text-chat-muted dark:text-chat-muted flex-shrink-0">
                    {searchIndex + 1}/{searchResults.length}
                  </span>
              }
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <IconButton variant="ghost" size="sm" onClick={() => navigateSearch('up')}>
                  <ChevronUpIcon className="w-4 h-4" />
                </IconButton>
                <IconButton variant="ghost" size="sm" onClick={() => navigateSearch('down')}>
                  <ChevronDownIcon className="w-4 h-4" />
                </IconButton>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchIndex(0);
                  }}>
                  <XIcon className="w-4 h-4" />
                </IconButton>
            </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Pinned Message */}
      {pinnedMessage &&
      <button
        onClick={() => scrollToMessage(pinnedMessage.id)}
        className="bg-chat-accent/10 border-b border-chat-accent/20 px-4 md:px-6 py-2 md:py-3 flex items-center gap-2 flex-shrink-0 w-full text-left hover:bg-chat-accent/15 transition-colors">
        
          <PinIcon className="w-4 h-4 text-chat-accent flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-chat-text dark:text-chat-text truncate">
              {pinnedMessage.content}
            </p>
          </div>
          <button
          onClick={(e) => {
            e.stopPropagation();
            setPinnedMessageId(undefined);
          }}
          className="p-1 hover:bg-chat-accent/20 rounded transition-colors">
          
            <XIcon className="w-3.5 h-3.5 text-chat-accent" />
          </button>
        </button>
      }

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto min-h-0 chat-wallpaper">
        
        <div className="px-3 md:px-6 py-4">
          {groupMessagesByDate().map((group, groupIdx) =>
          <div key={groupIdx}>
              <div className="flex justify-center my-4">
                <span className="bg-chat-card/90 dark:bg-chat-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-chat-muted dark:text-chat-muted border border-chat-border/50 dark:border-chat-border/50 shadow-sm">
                  {group.date}
                </span>
              </div>
              {group.messages.map((message) =>
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUser.id}
              showSenderName={isGroup}
              replyToMessage={
              message.replyTo ?
              messages.find((m) => m.id === message.replyTo) :
              undefined
              }
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
              onReplyPrivately={handleReplyPrivately} />

            )}
            </div>
          )}

          {messages.length === 0 &&
          <div className="flex flex-col items-center justify-center py-20 text-chat-muted dark:text-chat-muted">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">
                Send a message to start the conversation
              </p>
            </div>
          }

          {chat.isTyping &&
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="flex items-center gap-2 mb-4">
            
              <div className="bg-chat-card/90 dark:bg-chat-card/90 backdrop-blur-sm px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm">
                <span className="text-sm text-chat-muted dark:text-chat-muted">
                  {chat.typingUser} is typing
                </span>
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map((delay) =>
                <motion.div
                  key={delay}
                  animate={{
                    y: [0, -4, 0]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay
                  }}
                  className="w-1.5 h-1.5 bg-chat-muted dark:bg-chat-muted rounded-full" />

                )}
                </div>
              </div>
            </motion.div>
          }

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendVoice={handleSendVoice}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(undefined)}
        members={chat.participants.map(id => users[id]).filter(Boolean)}
        isGroupChat={chat.type === 'group'} />
      
    </div>);

}