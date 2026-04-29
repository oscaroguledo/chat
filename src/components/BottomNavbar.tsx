import React from 'react';
import {
  MessageSquareIcon,
  PhoneIcon,
  UsersIcon,
  SettingsIcon,
  UserIcon } from
'lucide-react';
export type MobileTab = 'chats' | 'calls' | 'contacts' | 'settings' | 'profile';
interface BottomNavbarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}
const tabs: {
  id: MobileTab;
  label: string;
  icon: React.ElementType;
}[] = [
{
  id: 'chats',
  label: 'Chats',
  icon: MessageSquareIcon
},
{
  id: 'calls',
  label: 'Calls',
  icon: PhoneIcon
},
{
  id: 'contacts',
  label: 'Contacts',
  icon: UsersIcon
},
{
  id: 'settings',
  label: 'Settings',
  icon: SettingsIcon
},
{
  id: 'profile',
  label: 'Profile',
  icon: UserIcon
}];

export function BottomNavbar({ activeTab, onTabChange }: BottomNavbarProps) {
  return (
    <nav className="md:hidden bg-chat-card dark:bg-chat-card border-t border-chat-border dark:border-chat-border px-1 py-1 safe-area-bottom">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-2 rounded-lg transition-colors ${isActive ? 'text-chat-accent' : 'text-chat-muted dark:text-chat-muted'}`}>
              
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>);

        })}
      </div>
    </nav>);

}