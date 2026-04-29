import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { InfoPanel } from './components/InfoPanel';
import { BottomNavbar, MobileTab } from './components/BottomNavbar';
import { MobileContactsView } from './components/MobileContactsView';
import { MobileSettingsView } from './components/MobileSettingsView';
import { MobileProfileView } from './components/MobileProfileView';
import { MobileCallsView } from './components/MobileCallsView';
import { CallModal, CallType } from './components/CallModal';
import { chats } from './data/mockData';
import { AnimatePresence } from 'framer-motion';
interface ActiveCall {
  contactName: string;
  contactAvatar: string;
  callType: CallType;
}
export function App() {
  const [activeChat, setActiveChat] = useState(chats[0]);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [mobileTab, setMobileTab] = useState<MobileTab>('chats');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
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
  const renderMobileContent = () => {
    if (mobileView === 'chat') {
      return (
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          <ChatWindow
            chat={activeChat}
            onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
            onBack={handleMobileBack}
            onStartCall={handleStartCall} />
          
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
            chats={chats}
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
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onToggleDarkMode={toggleDarkMode}
          darkMode={darkMode} />
        
        <ChatWindow
          chat={activeChat}
          onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
          onStartCall={handleStartCall} />
        
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