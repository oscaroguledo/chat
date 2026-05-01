import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatWindow } from '@/components/ChatWindow';
import { InfoPanel } from '@/components/InfoPanel';
import { BottomNavbar, MobileTab } from '@/components/BottomNavbar';
import { MobileContactsView } from '@/components/MobileContactsView';
import { MobileSettingsView } from '@/components/MobileSettingsView';
import { MobileProfileView } from '@/components/MobileProfileView';
import { MobileCallsView } from '@/components/MobileCallsView';
import { CallModal, CallType } from '@/components/ui/CallModal';
import { chats, Message, currentUser, users } from '@/data/mockData';
import { AnimatePresence } from 'framer-motion';
interface ActiveCall {
  contactName: string;
  contactAvatar: string;
  callType: CallType;
}
export function App() {
  const [allChats, setAllChats] = useState(chats);
  const [activeChat, setActiveChat] = useState(() => chats[0]);
  const [scrollToMessageId, setScrollToMessageId] = useState<string | undefined>(undefined);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [mobileTab, setMobileTab] = useState<MobileTab>('chats');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  // Store the message to reply to when using "Reply Privately" feature
  const [replyToMessage, setReplyToMessage] = useState<Message | undefined>(undefined);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSelectChat = (chat: typeof activeChat) => {
    setActiveChat(chat);
    setMobileView('chat');
    setShowInfoPanel(false);
    // Clear any pending reply when switching chats normally
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
  const handleStartCall = (
  contactName: string,
  contactAvatar: string,
  callType: CallType) =>
  {
    setActiveCall({
      contactName,
      contactAvatar,
      callType
    });
  };
  
  // Handle reply privately - opens direct chat with message sender
  const handleReplyPrivately = (senderId: string, quotedMessage: Message) => {
    // Check if direct chat already exists with sender
    const existingChat = allChats.find(
      c => c.type === 'direct' && 
      c.participants.includes(currentUser.id) && 
      c.participants.includes(senderId)
    );
    
    // Store the message we want to reply to
    setReplyToMessage(quotedMessage);
    
    if (existingChat) {
      setActiveChat(existingChat);
      setMobileView('chat');
      setShowInfoPanel(false);
    } else {
      // Create new direct chat
      const sender = users[senderId];
      if (!sender) return;
      
      const newChat = {
        id: `direct-${Date.now()}`,
        type: 'direct' as const,
        name: sender.name,
        avatar: sender.avatar,
        participants: [currentUser.id, senderId],
        unreadCount: 0,
        muted: false,
        messages: []
      };

      setAllChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat);
      setMobileView('chat');
      setShowInfoPanel(false);
    }
  };

  // Handle navigating to a message in any chat (for reply navigation)
  const handleNavigateToMessage = (chatId: string, messageId: string) => {
    const targetChat = allChats.find(c => c.id === chatId);
    if (targetChat) {
      setActiveChat(targetChat);
      setScrollToMessageId(messageId);
      setMobileView('chat');
      setShowInfoPanel(false);
    }
  };
  
  const renderMobileContent = () => {
    if (mobileView === 'chat') {
      return (
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          <ChatWindow
            chat={activeChat}
            initialScrollToMessageId={scrollToMessageId}
            initialReplyToMessage={replyToMessage}
            onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
            onBack={handleMobileBack}
            onStartCall={handleStartCall}
            onReplyPrivately={handleReplyPrivately}
            onNavigateToMessage={handleNavigateToMessage} />
          
          <AnimatePresence>
            {showInfoPanel &&
            <InfoPanel
              chat={activeChat}
              onClose={() => setShowInfoPanel(false)} />

            }
          </AnimatePresence>
        </div>);

    }
    switch (mobileTab) {
      case 'calls':
        return <MobileCallsView onStartCall={handleStartCall} />;
      case 'contacts':
        return <MobileContactsView />;
      case 'settings':
        return (
          <MobileSettingsView
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode} />);


      case 'profile':
        return <MobileProfileView />;
      case 'chats':
      default:
        return (
          <Sidebar
            chats={allChats}
            activeChat={activeChat}
            onSelectChat={handleSelectChat}
            onToggleDarkMode={toggleDarkMode}
            darkMode={darkMode} />);


    }
  };
  return (
    <div className="w-full h-screen bg-chat-bg dark:bg-chat-bg flex flex-col md:flex-row overflow-hidden">
      {/* Mobile layout */}
      <div className="flex flex-col flex-1 md:hidden overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderMobileContent()}
        </div>
        {mobileView !== 'chat' &&
        <BottomNavbar activeTab={mobileTab} onTabChange={handleTabChange} />
        }
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <Sidebar
          chats={allChats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onToggleDarkMode={toggleDarkMode}
          darkMode={darkMode} />
        
        <ChatWindow
          chat={activeChat}
          initialScrollToMessageId={scrollToMessageId}
          initialReplyToMessage={replyToMessage}
          onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
          onStartCall={handleStartCall}
          onReplyPrivately={handleReplyPrivately}
          onNavigateToMessage={handleNavigateToMessage} />
        
        <AnimatePresence>
          {showInfoPanel &&
          <InfoPanel
            chat={activeChat}
            onClose={() => setShowInfoPanel(false)} />

          }
        </AnimatePresence>
      </div>

      {/* Call Modal — works on both mobile and desktop */}
      <AnimatePresence>
        {activeCall &&
        <CallModal
          contactName={activeCall.contactName}
          contactAvatar={activeCall.contactAvatar}
          callType={activeCall.callType}
          onClose={() => setActiveCall(null)} />

        }
      </AnimatePresence>
    </div>);

}