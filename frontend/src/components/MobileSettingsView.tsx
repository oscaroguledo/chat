import React from 'react';
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  LockIcon,
  GlobeIcon,
  ImageIcon,
  InfoIcon,
  ChevronRightIcon } from
'lucide-react';
interface MobileSettingsViewProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}
export function MobileSettingsView({
  darkMode,
  onToggleDarkMode
}: MobileSettingsViewProps) {
  const settingsGroups = [
  {
    title: 'Preferences',
    items: [
    {
      icon: darkMode ? SunIcon : MoonIcon,
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      action: onToggleDarkMode,
      hasToggle: true
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
      label: 'Two-Factor Authentication',
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
    <div className="flex-1 flex flex-col h-full bg-chat-bg dark:bg-chat-bg">
      <div className="p-4 bg-chat-card dark:bg-chat-card border-b border-chat-border dark:border-chat-border">
        <h2 className="text-lg font-semibold text-chat-text dark:text-chat-text">
          Settings
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {settingsGroups.map((group) =>
        <div key={group.title} className="mt-4">
            <p className="px-4 pb-2 text-xs font-semibold text-chat-muted dark:text-chat-muted uppercase tracking-wider">
              {group.title}
            </p>
            <div className="bg-chat-card dark:bg-chat-card">
              {group.items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-chat-area dark:hover:bg-chat-area transition-colors text-left border-b border-chat-border/50 dark:border-chat-border/50 last:border-b-0">
                  
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
          </div>
        )}
      </div>
    </div>);

}