import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { AuthScreen } from '@/components/AuthScreen';
import { Sidebar } from '@/components/Sidebar';
import { ChatWindow } from '@/components/ChatWindow';
import { InfoPanel } from '@/components/InfoPanel';
import { BottomNavbar, MobileTab } from '@/components/BottomNavbar';
import { MobileContactsView } from '@/components/MobileContactsView';
import { MobileSettingsView } from '@/components/MobileSettingsView';
import { MobileProfileView } from '@/components/MobileProfileView';
import { MobileCallsView } from '@/components/MobileCallsView';
import { CallModal, CallType } from '@/components/ui/CallModal';
import { AnimatePresence } from 'framer-motion';
import { Chat, ChatMessage } from '@/services/api';
import { MessageCircle } from 'lucide-react';

interface ActiveCall {
  contactName: string;
  contactAvatar: string;
  callType: CallType;
}

function ChatApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const { chats, activeChat, setActiveChat, messages } = useChat();

  const [scrollToMessageId, setScrollToMessageId] = useState<string | undefined>(undefined);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [mobileTab, setMobileTab] = useState<MobileTab>('chats');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | undefined>(undefined);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-chat-bg">
        <div className="flex flex-col items-center gap-3">
          <MessageCircle className="w-12 h-12 text-indigo-500 animate-pulse" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
    setMobileView('chat');
    setShowInfoPanel(false);
    setReplyToMessage(undefined);
  };

  const handleMobileBack = () => {
    setMobileView('list');
    setShowInfoPanel(false);
  };

  const handleTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
    setMobileView('list');
    setShowInfoPanel(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleStartCall = (contactName: string, contactAvatar: string, callType: CallType) => {
    setActiveCall({ contactName, contactAvatar, callType });
  };

  const handleReplyPrivately = async (senderId: string, quotedMessage: ChatMessage) => {
    setReplyToMessage(quotedMessage);
    const existing = chats.find(
      c => c.type === 'direct' && c.participants.some(p => p.id === senderId)
    );
    if (existing) {
      setActiveChat(existing);
      setMobileView('chat');
      setShowInfoPanel(false);
    }
  };

  const handleNavigateToMessage = (chatId: string, messageId: string) => {
    const targetChat = chats.find(c => c.id === chatId);
    if (targetChat) {
      setActiveChat(targetChat);
      setScrollToMessageId(messageId);
      setMobileView('chat');
      setShowInfoPanel(false);
    }
  };

  // Convert real Chat to the shape expected by existing UI components
  const adaptedChats = chats.map(adaptChat);
  const adaptedActiveChat = activeChat ? adaptChat(activeChat) : adaptedChats[0];

  const renderMobileContent = () => {
    if (mobileView === 'chat' && adaptedActiveChat) {
      return (
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          <ChatWindow
            chat={adaptedActiveChat}
            initialScrollToMessageId={scrollToMessageId}
            initialReplyToMessage={replyToMessage as any}
            onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
            onBack={handleMobileBack}
            onStartCall={handleStartCall}
            onReplyPrivately={handleReplyPrivately as any}
            onNavigateToMessage={handleNavigateToMessage}
          />
          <AnimatePresence>
            {showInfoPanel && (
              <InfoPanel chat={adaptedActiveChat} onClose={() => setShowInfoPanel(false)} />
            )}
          </AnimatePresence>
        </div>
      );
    }
    switch (mobileTab) {
      case 'calls':
        return <MobileCallsView onStartCall={handleStartCall} />;
      case 'contacts':
        return <MobileContactsView />;
      case 'settings':
        return <MobileSettingsView darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />;
      case 'profile':
        return <MobileProfileView />;
      default:
        return (
          <Sidebar
            chats={adaptedChats}
            activeChat={adaptedActiveChat}
            onSelectChat={c => handleSelectChat(chats.find(ch => ch.id === c.id)!)}
            onToggleDarkMode={toggleDarkMode}
            darkMode={darkMode}
          />
        );
    }
  };

  return (
    <div className="w-full h-screen bg-chat-bg dark:bg-chat-bg flex flex-col md:flex-row overflow-hidden">
      {/* Mobile */}
      <div className="flex flex-col flex-1 md:hidden overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">{renderMobileContent()}</div>
        {mobileView !== 'chat' && <BottomNavbar activeTab={mobileTab} onTabChange={handleTabChange} />}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <Sidebar
          chats={adaptedChats}
          activeChat={adaptedActiveChat}
          onSelectChat={c => handleSelectChat(chats.find(ch => ch.id === c.id)!)}
          onToggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
        />
        {adaptedActiveChat && (
          <ChatWindow
            chat={adaptedActiveChat}
            initialScrollToMessageId={scrollToMessageId}
            initialReplyToMessage={replyToMessage as any}
            onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
            onStartCall={handleStartCall}
            onReplyPrivately={handleReplyPrivately as any}
            onNavigateToMessage={handleNavigateToMessage}
          />
        )}
        <AnimatePresence>
          {showInfoPanel && adaptedActiveChat && (
            <InfoPanel chat={adaptedActiveChat} onClose={() => setShowInfoPanel(false)} />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeCall && (
          <CallModal
            contactName={activeCall.contactName}
            contactAvatar={activeCall.contactAvatar}
            callType={activeCall.callType}
            onClose={() => setActiveCall(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Adapt API Chat to the shape the existing UI components expect
function adaptChat(chat: Chat) {
  const lastMsg = chat.lastMessage;
  return {
    id: chat.id,
    type: chat.type,
    name: chat.name || chat.participants.filter(p => p.role !== 'admin').map(p => p.name).join(', ') || 'Chat',
    avatar: chat.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${chat.id}`,
    participants: chat.participants.map(p => p.id),
    unreadCount: chat.unreadCount,
    muted: false,
    messages: lastMsg ? [adaptMessage(lastMsg)] : [],
  };
}

function adaptMessage(msg: ChatMessage) {
  const attach = msg.attachments?.[0];
  return {
    id: msg.id,
    senderId: msg.sender?.id || '',
    content: msg.content || (msg.deleted ? 'This message was deleted' : ''),
    timestamp: new Date(msg.createdAt),
    type: mapMsgType(msg.type),
    status: 'read' as const,
    reactions: msg.reactions?.map(r => ({ emoji: r.emoji, userIds: r.userIds })) || [],
    edited: msg.edited,
    imageUrl: msg.type === 'image' ? attach?.url : undefined,
    videoUrl: msg.type === 'video' ? attach?.url : undefined,
    voiceUrl: msg.type === 'audio' ? attach?.url : undefined,
    voiceDuration: msg.type === 'audio' ? (attach?.duration || 0) : undefined,
    fileName: msg.type === 'file' ? attach?.fileName : undefined,
    fileSize: msg.type === 'file' && attach?.fileSize ? formatBytes(attach.fileSize) : undefined,
    fileUrl: msg.type === 'file' ? attach?.url : undefined,
    replyTo: msg.replyToId,
    replyToData: msg.replyTo ? {
      senderId: msg.replyTo.sender?.id || '',
      senderName: msg.replyTo.sender?.name || 'Unknown',
      content: msg.replyTo.content || '',
    } : undefined,
  };
}

function mapMsgType(t: string): 'text' | 'image' | 'voice' | 'file' | 'video' {
  if (t === 'audio') return 'voice';
  if (['text', 'image', 'video', 'file'].includes(t)) return t as any;
  return 'text';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          <ChatApp />
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
