import React, { useEffect, useState } from 'react';
import { Chat, currentUser, users } from '../data/mockData';

export interface Call {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'audio' | 'video';
  timestamp: Date;
  duration?: string;
}

const mockCalls: Call[] = [
  {
    id: 'call-1',
    contactId: 'user-2',
    contactName: 'Sarah Chen',
    contactAvatar: users['user-2'].avatar,
    type: 'incoming',
    callType: 'video',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: '15:30'
  },
  {
    id: 'call-2',
    contactId: 'user-3',
    contactName: 'Marcus Johnson',
    contactAvatar: users['user-3'].avatar,
    type: 'outgoing',
    callType: 'audio',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    duration: '8:45'
  },
  {
    id: 'call-3',
    contactId: 'user-4',
    contactName: 'Emma Wilson',
    contactAvatar: users['user-4'].avatar,
    type: 'missed',
    callType: 'video',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 'call-4',
    contactId: 'user-7',
    contactName: 'David Kim',
    contactAvatar: users['user-7'].avatar,
    type: 'incoming',
    callType: 'audio',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    duration: '4:20'
  }
];
import {
  SearchIcon,
  MoreVerticalIcon,
  BellOffIcon,
  SettingsIcon,
  UsersIcon,
  UserIcon,
  ArrowLeftIcon,
  MoonIcon,
  SunIcon,
  LockIcon,
  GlobeIcon,
  ImageIcon,
  InfoIcon,
  ChevronRightIcon,
  BellIcon,
  CameraIcon,
  PencilIcon,
  PhoneIcon,
  PhoneMissedIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
type SidebarView = 'chats' | 'contacts' | 'settings' | 'profile' | 'calls';
interface SidebarProps {
  chats: Chat[];
  activeChat: Chat;
  onSelectChat: (chat: Chat) => void;
  onToggleDarkMode: () => void;
  darkMode: boolean;
}
export function Sidebar({
  chats,
  activeChat,
  onSelectChat,
  onToggleDarkMode,
  darkMode
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [view, setView] = useState<SidebarView>('chats');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'group'>('all');
  const filteredChats = chats
    .filter((chat) => {
      // Apply search filter
      const matchesSearch = 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.messages.some((m) =>
          m.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      // Apply type filter
      if (chatFilter === 'unread') {
        return matchesSearch && chat.unreadCount > 0;
      }
      if (chatFilter === 'group') {
        return matchesSearch && chat.type === 'group';
      }
      return matchesSearch;
    });
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);
  const formatLastMessageTime = (messages: any[]) => {
    if (messages.length === 0) return '';
    const lastMessage = messages[messages.length - 1];
    const date = lastMessage.timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  const getLastMessagePreview = (chat: Chat) => {
    if (chat.messages.length === 0) return '';
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage.type === 'image') return '📷 Photo';
    if (lastMessage.type === 'voice') return '🎤 Voice message';
    if (lastMessage.type === 'video') return '🎬 Video';
    if (lastMessage.type === 'file') return `📎 ${lastMessage.fileName}`;
    return lastMessage.content;
  };
  const contactList = Object.values(users).filter(
    (u) => u.id !== currentUser.id
  );
  // Sub-view header
  const renderSubHeader = (title: string) =>
  <div className="p-4 border-b border-chat-border dark:border-chat-border flex items-center gap-3">
      <button
      onClick={() => setView('chats')}
      className="p-1.5 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors text-chat-text dark:text-chat-text">
      
        <ArrowLeftIcon className="w-5 h-5" />
      </button>
      <h3 className="font-semibold text-chat-text dark:text-chat-text">
        {title}
      </h3>
    </div>;

  // Contacts view
  const renderContacts = () =>
  <>
      {renderSubHeader('Contacts')}
      <div className="flex-1 overflow-y-auto">
        {contactList.map((user) =>
      <div
        key={user.id}
        className="flex items-center gap-3 p-4 hover:bg-chat-area dark:hover:bg-chat-area transition-colors">
        
            <div className="relative flex-shrink-0">
              <img
            src={user.avatar}
            alt={user.name}
            className="w-11 h-11 rounded-full" />
          
              {user.status === 'online' &&
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-chat-online border-2 border-chat-card dark:border-chat-card rounded-full" />
          }
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-chat-text dark:text-chat-text text-sm">
                {user.name}
              </h4>
              <p className="text-xs text-chat-muted dark:text-chat-muted truncate">
                {user.bio || (
            user.status === 'online' ?
            'Online' :
            `Last seen ${user.lastSeen}`)}
              </p>
            </div>
          </div>
      )}
      </div>
    </>;

  // Settings view
  const renderSettings = () => {
    const groups = [
    {
      title: 'Preferences',
      items: [
      {
        icon: darkMode ? SunIcon : MoonIcon,
        label: darkMode ? 'Light Mode' : 'Dark Mode',
        action: onToggleDarkMode
      },
      {
        icon: BellIcon,
        label: 'Notifications',
        subtitle: 'Sounds, vibration'
      },
      {
        icon: ImageIcon,
        label: 'Chat Wallpaper',
        subtitle: 'Change background'
      },
      {
        icon: GlobeIcon,
        label: 'Language',
        subtitle: 'English'
      }]

    },
    {
      title: 'Security',
      items: [
      {
        icon: LockIcon,
        label: 'Privacy',
        subtitle: 'Last seen, profile photo'
      },
      {
        icon: LockIcon,
        label: 'Two-Factor Auth',
        subtitle: 'Enabled'
      }]

    },
    {
      title: 'About',
      items: [
      {
        icon: InfoIcon,
        label: 'Help',
        subtitle: 'FAQ, contact us'
      },
      {
        icon: InfoIcon,
        label: 'About',
        subtitle: 'Version 2.0.1'
      }]

    }];

    return (
      <>
        {renderSubHeader('Settings')}
        <div className="flex-1 overflow-y-auto">
          {groups.map((group) =>
          <div key={group.title} className="mt-3">
              <p className="px-4 pb-1.5 text-[10px] font-semibold text-chat-muted dark:text-chat-muted uppercase tracking-wider">
                {group.title}
              </p>
              {group.items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-chat-area dark:hover:bg-chat-area transition-colors text-left">
                  
                    <Icon className="w-5 h-5 text-chat-muted dark:text-chat-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-chat-text dark:text-chat-text">
                        {item.label}
                      </p>
                      {item.subtitle &&
                    <p className="text-xs text-chat-muted dark:text-chat-muted">
                          {item.subtitle}
                        </p>
                    }
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted flex-shrink-0" />
                  </button>);

            })}
            </div>
          )}
        </div>
      </>);

  };
  // Calls view
  const renderCalls = () => {
    const formatCallTime = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getCallIcon = (call: Call) => {
      if (call.type === 'missed') {
        return <PhoneMissedIcon className="w-4 h-4 text-red-500" />;
      }
      if (call.type === 'incoming') {
        return <ArrowDownLeftIcon className="w-4 h-4 text-green-500" />;
      }
      return <ArrowUpRightIcon className="w-4 h-4 text-chat-accent" />;
    };

    return (
      <>
        {renderSubHeader('Calls')}
        <div className="flex-1 overflow-y-auto">
          {mockCalls.map((call) => (
            <div
              key={call.id}
              className="flex items-center gap-3 p-4 hover:bg-chat-area dark:hover:bg-chat-area transition-colors">
              <div className="relative flex-shrink-0">
                <img
                  src={call.contactAvatar}
                  alt={call.contactName}
                  className="w-11 h-11 rounded-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-chat-text dark:text-chat-text text-sm">
                  {call.contactName}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  {getCallIcon(call)}
                  <span className={`text-xs ${call.type === 'missed' ? 'text-red-500' : 'text-chat-muted dark:text-chat-muted'}`}>
                    {call.type === 'incoming' ? 'Incoming' : call.type === 'outgoing' ? 'Outgoing' : 'Missed'}
                  </span>
                  {call.callType === 'video' && (
                    <span className="text-xs text-chat-muted dark:text-chat-muted ml-1">• Video</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-chat-muted dark:text-chat-muted">
                  {formatCallTime(call.timestamp)}
                </span>
                {call.duration && (
                  <span className="text-xs text-chat-muted dark:text-chat-muted">
                    {call.duration}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  // Profile view
  const renderProfile = () =>
  <>
      {renderSubHeader('Profile')}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center py-8">
          <div className="relative mb-4">
            <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-24 h-24 rounded-full" />
          
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-chat-accent rounded-full flex items-center justify-center text-white shadow-md">
              <CameraIcon className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-xl font-semibold text-chat-text dark:text-chat-text">
            {currentUser.name}
          </h3>
          <p className="text-sm text-chat-muted dark:text-chat-muted mt-1">
            Online
          </p>
        </div>
        <div className="border-t border-chat-border dark:border-chat-border">
          {[
        {
          label: 'Display Name',
          value: currentUser.name
        },
        {
          label: 'Bio',
          value: "Hey there! I'm using ChatApp"
        },
        {
          label: 'Phone',
          value: '+1 (555) 123-4567'
        }].
        map((field) =>
        <div
          key={field.label}
          className="px-4 py-3.5 border-b border-chat-border/50 dark:border-chat-border/50 flex items-center justify-between">
          
              <div>
                <p className="text-xs text-chat-muted dark:text-chat-muted mb-0.5">
                  {field.label}
                </p>
                <p className="text-sm font-medium text-chat-text dark:text-chat-text">
                  {field.value}
                </p>
              </div>
              <PencilIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
            </div>
        )}
        </div>
      </div>
    </>;

  // Chats list view
  const renderChats = () =>
  <>
      <div className="p-4 border-b border-chat-border dark:border-chat-border">
        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full" />
            
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-chat-online border-2 border-chat-card dark:border-chat-card rounded-full" />
            </div>
            <div>
              <h3 className="font-semibold text-chat-text dark:text-chat-text">
                {currentUser.name}
              </h3>
              <p className="text-xs text-chat-muted dark:text-chat-muted">
                Online
              </p>
            </div>
          </div>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors text-chat-muted dark:text-chat-muted">
            
              <MoreVerticalIcon className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showMenu &&
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: -5
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -5
              }}
              className="absolute right-0 top-full mt-1 bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-xl shadow-lg overflow-hidden z-30 min-w-[160px]">
              
                  {[
              {
                icon: UsersIcon,
                label: 'Contacts',
                view: 'contacts' as SidebarView
              },
              {
                icon: PhoneIcon,
                label: 'Calls',
                view: 'calls' as SidebarView
              },
              {
                icon: SettingsIcon,
                label: 'Settings',
                view: 'settings' as SidebarView
              },
              {
                icon: UserIcon,
                label: 'Profile',
                view: 'profile' as SidebarView
              }].
              map(({ icon: Icon, label, view: v }) =>
              <button
                key={label}
                onClick={() => {
                  setView(v);
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-chat-area dark:hover:bg-chat-area transition-colors w-full text-left">
                
                      <Icon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
                      <span className="text-sm text-chat-text dark:text-chat-text">
                        {label}
                      </span>
                    </button>
              )}
                </motion.div>
            }
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile header */}
        <div className="flex md:hidden items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-chat-text dark:text-chat-text">
            Chats
          </h2>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors text-chat-muted dark:text-chat-muted">
              <SearchIcon className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors text-chat-muted dark:text-chat-muted">
              <MoreVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-muted dark:text-chat-muted" />
          <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-chat-area dark:bg-chat-area rounded-lg outline-none text-sm text-chat-text dark:text-chat-text placeholder-chat-muted dark:placeholder-chat-muted" />
        
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setChatFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              chatFilter === 'all'
                ? 'bg-chat-accent text-white'
                : 'bg-chat-area dark:bg-chat-area text-chat-muted dark:text-chat-muted hover:bg-chat-accent/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setChatFilter('unread')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              chatFilter === 'unread'
                ? 'bg-chat-accent text-white'
                : 'bg-chat-area dark:bg-chat-area text-chat-muted dark:text-chat-muted hover:bg-chat-accent/10'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setChatFilter('group')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              chatFilter === 'group'
                ? 'bg-chat-accent text-white'
                : 'bg-chat-area dark:bg-chat-area text-chat-muted dark:text-chat-muted hover:bg-chat-accent/10'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat, index) => {
        const isActive = chat.id === activeChat.id;
        const hasOnlineUser = chat.participants.some((id) => {
          const user = users[id];
          return user && user.status === 'online' && id !== currentUser.id;
        });
        return (
          <motion.button
            key={chat.id}
            initial={{
              opacity: 0,
              x: -20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              delay: index * 0.05
            }}
            onClick={() => onSelectChat(chat)}
            className={`w-full p-4 flex items-start gap-3 hover:bg-chat-area dark:hover:bg-chat-area transition-colors ${isActive ? 'md:bg-chat-area md:dark:bg-chat-area' : ''}`}>
            
              <div className="relative flex-shrink-0">
                <img
                src={chat.avatar}
                alt={chat.name}
                className="w-12 h-12 rounded-full" />
              
                {hasOnlineUser && chat.type === 'direct' &&
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-chat-online border-2 border-chat-card dark:border-chat-card rounded-full" />
              }
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-chat-text dark:text-chat-text truncate">
                    {chat.name}
                  </h4>
                  <span className="text-xs text-chat-muted dark:text-chat-muted flex-shrink-0 ml-2">
                    {formatLastMessageTime(chat.messages)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-chat-muted dark:text-chat-muted truncate flex-1">
                    {getLastMessagePreview(chat)}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {chat.muted &&
                  <BellOffIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
                  }
                    {chat.unreadCount > 0 &&
                  <span className="bg-chat-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {chat.unreadCount}
                      </span>
                  }
                  </div>
                </div>
              </div>
            </motion.button>);

      })}
        {filteredChats.length === 0 && searchQuery &&
      <div className="p-8 text-center text-chat-muted dark:text-chat-muted text-sm">
            No chats found
          </div>
      }
      </div>
    </>;

  return (
    <div className="w-full md:w-80 bg-chat-card dark:bg-chat-card md:border-r border-chat-border dark:border-chat-border flex flex-col h-full">
      {view === 'chats' && renderChats()}
      {view === 'contacts' && renderContacts()}
      {view === 'calls' && renderCalls()}
      {view === 'settings' && renderSettings()}
      {view === 'profile' && renderProfile()}
    </div>);

}