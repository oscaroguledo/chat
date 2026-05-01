import React, { useState } from 'react';
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  LockIcon,
  GlobeIcon,
  ImageIcon,
  InfoIcon,
  ChevronRightIcon,
  XIcon,
  CheckIcon,
  ShieldIcon,
  EyeIcon,
  Volume2Icon,
  VibrateIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { UserSettings, defaultUserSettings } from '@/data/mockData';
interface MobileSettingsViewProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function MobileSettingsView({
  darkMode,
  onToggleDarkMode
}: MobileSettingsViewProps) {
  const [settings, setSettings] = useState<UserSettings>(defaultUserSettings);

  const [activeModal, setActiveModal] = useState<'notifications' | 'privacy' | 'wallpaper' | 'language' | '2fa' | null>(null);

  const updateNotifications = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const updatePrivacy = (key: keyof UserSettings['privacy'], value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }));
  };

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Portuguese', 'Russian'];
  const wallpapers = [
    { id: 'default', name: 'Default', color: 'bg-chat-bg' },
    { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-50 dark:bg-blue-950' },
    { id: 'green', name: 'Forest Green', color: 'bg-green-50 dark:bg-green-950' },
    { id: 'purple', name: 'Royal Purple', color: 'bg-purple-50 dark:bg-purple-950' },
    { id: 'dark', name: 'Midnight', color: 'bg-gray-900' },
  ];
  const settingsGroups: Array<{
    title: string;
    items: Array<{
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      subtitle?: string;
      action?: () => void;
      hasToggle?: boolean;
    }>;
  }> = [
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
      subtitle: `${settings.notifications.sound ? 'Sound on' : 'Sound off'}, ${settings.notifications.vibration ? 'Vibration on' : 'Vibration off'}`,
      action: () => setActiveModal('notifications')
    },
    {
      icon: ImageIcon,
      label: 'Chat Wallpaper',
      subtitle: wallpapers.find(w => w.id === settings.wallpaper)?.name || 'Default',
      action: () => setActiveModal('wallpaper')
    },
    {
      icon: GlobeIcon,
      label: 'Language',
      subtitle: settings.language,
      action: () => setActiveModal('language')
    }]

  },
  {
    title: 'Security',
    items: [
    {
      icon: LockIcon,
      label: 'Privacy',
      subtitle: `Last seen: ${settings.privacy.lastSeen}`,
      action: () => setActiveModal('privacy')
    },
    {
      icon: ShieldIcon,
      label: 'Two-Factor Authentication',
      subtitle: settings.twoFactorEnabled ? 'Enabled' : 'Disabled',
      action: () => setActiveModal('2fa')
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
                <Button
                  key={idx}
                  onClick={item.action || (() => {})}
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
                    {item.action && <ChevronRightIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted flex-shrink-0" />}
                  </Button>);

            })}
            </div>
          </div>
        )}
      </div>

      {/* Notifications Modal */}
      <AnimatePresence>
        {activeModal === 'notifications' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-chat-card dark:bg-chat-card w-full sm:w-96 sm:rounded-2xl rounded-t-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-chat-text dark:text-chat-text">Notifications</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} className="p-2 rounded-full">
                  <XIcon className="w-5 h-5 text-chat-muted" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Volume2Icon className="w-5 h-5 text-chat-muted" />
                    <span className="text-chat-text dark:text-chat-text">Sound</span>
                  </div>
                  <Button
                    onClick={() => updateNotifications('sound', !settings.notifications.sound)}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.sound ? 'bg-chat-accent' : 'bg-chat-border'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.notifications.sound ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                  </Button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <VibrateIcon className="w-5 h-5 text-chat-muted" />
                    <span className="text-chat-text dark:text-chat-text">Vibration</span>
                  </div>
                  <Button
                    onClick={() => updateNotifications('vibration', !settings.notifications.vibration)}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.vibration ? 'bg-chat-accent' : 'bg-chat-border'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.notifications.vibration ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                  </Button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <EyeIcon className="w-5 h-5 text-chat-muted" />
                    <span className="text-chat-text dark:text-chat-text">Message Preview</span>
                  </div>
                  <Button
                    onClick={() => updateNotifications('messagePreview', !settings.notifications.messagePreview)}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.messagePreview ? 'bg-chat-accent' : 'bg-chat-border'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.notifications.messagePreview ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {activeModal === 'privacy' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-chat-card dark:bg-chat-card w-full sm:w-96 sm:rounded-2xl rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-chat-text dark:text-chat-text">Privacy</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} className="p-2 rounded-full">
                  <XIcon className="w-5 h-5 text-chat-muted" />
                </Button>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-chat-text dark:text-chat-text mb-3">Last Seen</p>
                  <div className="space-y-2">
                    {(['everyone', 'contacts', 'nobody'] as const).map(option => (
                      <Button
                        key={option}
                        onClick={() => updatePrivacy('lastSeen', option)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-chat-area transition-colors"
                      >
                        <span className="capitalize text-chat-text dark:text-chat-text">{option}</span>
                        {settings.privacy.lastSeen === option && <CheckIcon className="w-5 h-5 text-chat-accent" />}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-chat-text dark:text-chat-text mb-3">Profile Photo</p>
                  <div className="space-y-2">
                    {(['everyone', 'contacts', 'nobody'] as const).map(option => (
                      <Button
                        key={option}
                        onClick={() => updatePrivacy('profilePhoto', option)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-chat-area transition-colors"
                      >
                        <span className="capitalize text-chat-text dark:text-chat-text">{option}</span>
                        {settings.privacy.profilePhoto === option && <CheckIcon className="w-5 h-5 text-chat-accent" />}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-chat-text dark:text-chat-text">Read Receipts</span>
                  <Button
                    onClick={() => updatePrivacy('readReceipts', !settings.privacy.readReceipts)}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.privacy.readReceipts ? 'bg-chat-accent' : 'bg-chat-border'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.privacy.readReceipts ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Modal */}
      <AnimatePresence>
        {activeModal === 'language' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-chat-card dark:bg-chat-card w-full sm:w-96 sm:rounded-2xl rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-chat-text dark:text-chat-text">Language</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} className="p-2 rounded-full">
                  <XIcon className="w-5 h-5 text-chat-muted" />
                </Button>
              </div>
              <div className="space-y-1">
                {languages.map(lang => (
                  <Button
                    key={lang}
                    onClick={() => {
                      setSettings(prev => ({ ...prev, language: lang }));
                      setActiveModal(null);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-chat-area transition-colors"
                  >
                    <span className="text-chat-text dark:text-chat-text">{lang}</span>
                    {settings.language === lang && <CheckIcon className="w-5 h-5 text-chat-accent" />}
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallpaper Modal */}
      <AnimatePresence>
        {activeModal === 'wallpaper' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-chat-card dark:bg-chat-card w-full sm:w-96 sm:rounded-2xl rounded-t-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-chat-text dark:text-chat-text">Chat Wallpaper</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} className="p-2 rounded-full">
                  <XIcon className="w-5 h-5 text-chat-muted" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {wallpapers.map(wp => (
                  <Button
                    key={wp.id}
                    onClick={() => {
                      setSettings(prev => ({ ...prev, wallpaper: wp.id }));
                      setActiveModal(null);
                    }}
                    className={`p-4 rounded-xl ${wp.color} border-2 transition-all ${settings.wallpaper === wp.id ? 'border-chat-accent' : 'border-transparent'}`}
                  >
                    <div className="h-16 rounded-lg bg-white/50 dark:bg-black/30 mb-2" />
                    <p className="text-sm font-medium text-chat-text dark:text-chat-text">{wp.name}</p>
                    {settings.wallpaper === wp.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-chat-accent rounded-full flex items-center justify-center">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2FA Modal */}
      <AnimatePresence>
        {activeModal === '2fa' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-chat-card dark:bg-chat-card w-full sm:w-96 sm:rounded-2xl rounded-t-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-chat-text dark:text-chat-text">Two-Factor Authentication</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} className="p-2 rounded-full">
                  <XIcon className="w-5 h-5 text-chat-muted" />
                </Button>
              </div>
              <div className="text-center py-4">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${settings.twoFactorEnabled ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                  <ShieldIcon className={`w-8 h-8 ${settings.twoFactorEnabled ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                </div>
                <p className="text-chat-text dark:text-chat-text font-medium mb-2">
                  {settings.twoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                </p>
                <p className="text-sm text-chat-muted dark:text-chat-muted mb-6">
                  {settings.twoFactorEnabled 
                    ? 'Your account is protected with an additional layer of security.' 
                    : 'Enable 2FA to add an extra layer of security to your account.'}
                </p>
                <Button
                  variant={settings.twoFactorEnabled ? 'danger' : 'primary'}
                  fullWidth
                  onClick={() => setSettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}>
                  {settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>);

}