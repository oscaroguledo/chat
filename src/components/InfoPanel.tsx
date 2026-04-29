import React, { useState } from 'react';
import { Chat, users, currentUser } from '../data/mockData';
import {
  XIcon,
  BellOffIcon,
  FlagIcon,
  ShieldCheckIcon,
  CrownIcon,
  ArrowLeftIcon,
  ImageIcon,
  FileIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronUpIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface InfoPanelProps {
  chat: Chat;
  onClose: () => void;
}
export function InfoPanel({ chat, onClose }: InfoPanelProps) {
  const isGroup = chat.type === 'group';
  const otherUser = !isGroup ?
  users[chat.participants.find((id) => id !== currentUser.id) || ''] :
  null;
  const members = isGroup ?
  chat.participants.map((id) => users[id]).filter(Boolean) :
  [];

  const [expandedSections, setExpandedSections] = useState({
    media: true,
    files: true,
    links: true
  });

  const toggleSection = (section: 'media' | 'files' | 'links') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Extract shared media from chat messages (images, videos, voice)
  const sharedMedia: Array<{ type: 'image' | 'video' | 'voice'; url: string; duration?: number }> = [];
  chat.messages.forEach(m => {
    if (m.type === 'image' && m.imageUrl) {
      sharedMedia.push({ type: 'image', url: m.imageUrl });
    } else if (m.type === 'video' && m.videoUrl) {
      sharedMedia.push({ type: 'video', url: m.videoUrl });
    } else if (m.type === 'voice' && m.voiceUrl) {
      sharedMedia.push({ type: 'voice', url: m.voiceUrl, duration: m.voiceDuration });
    }
  });

  // Extract shared files from chat messages
  const sharedFiles = chat.messages
    .filter(m => m.type === 'file')
    .map(m => ({
      name: m.fileName,
      size: m.fileSize,
      url: m.fileUrl
    }))
    .filter(f => f.name && f.url);

  // Extract links from text messages
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const sharedLinks = chat.messages
    .filter(m => m.type === 'text' && m.content.match(linkRegex))
    .map(m => {
      const matches = m.content.match(linkRegex);
      return matches || [];
    })
    .flat()
    .filter(Boolean);
  return (
    <motion.div
      initial={{
        x: 300,
        opacity: 0
      }}
      animate={{
        x: 0,
        opacity: 1
      }}
      exit={{
        x: 300,
        opacity: 0
      }}
      className="w-full md:w-80 absolute md:relative inset-0 md:inset-auto z-20 bg-chat-card dark:bg-chat-card md:border-l border-chat-border dark:border-chat-border h-full overflow-y-auto">
      
      {/* Header */}
      <div className="p-4 border-b border-chat-border dark:border-chat-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors text-chat-text dark:text-chat-text">
            
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-chat-text dark:text-chat-text">
            {isGroup ? 'Group Info' : 'Contact Info'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="hidden md:flex p-2 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors text-chat-muted dark:text-chat-muted">
          
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Profile */}
      <div className="p-6 text-center border-b border-chat-border dark:border-chat-border">
        <img
          src={chat.avatar}
          alt={chat.name}
          className="w-24 h-24 rounded-full mx-auto mb-4" />
        
        <h2 className="text-xl font-semibold text-chat-text dark:text-chat-text mb-1">
          {chat.name}
        </h2>
        {otherUser &&
        <div className="space-y-1">
            <p className="text-sm text-chat-muted dark:text-chat-muted">
              {otherUser.status === 'online' ?
            <span className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-chat-online rounded-full" />
                  Online
                </span> :

            `Last seen ${otherUser.lastSeen}`
            }
            </p>
            {otherUser.bio &&
          <p className="text-sm text-chat-text dark:text-chat-text mt-2">
                {otherUser.bio}
              </p>
          }
          </div>
        }
        {isGroup &&
        <p className="text-sm text-chat-muted dark:text-chat-muted">
            {members.length} members
          </p>
        }
      </div>

      {/* Shared Media */}
      {sharedMedia.length > 0 && (
      <div className="border-b border-chat-border dark:border-chat-border">
        <button
          onClick={() => toggleSection('media')}
          className="w-full p-4 flex items-center justify-between hover:bg-chat-area dark:hover:bg-chat-area transition-colors"
        >
          <h4 className="font-semibold text-chat-text dark:text-chat-text flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Shared Media ({sharedMedia.length})
          </h4>
          {expandedSections.media ? (
            <ChevronUpIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.media && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {sharedMedia.slice(0, 6).map((media, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden bg-chat-area dark:bg-chat-area relative">
                    
                      {media.type === 'image' && (
                        <img
                          src={media.url}
                          alt={`Shared media ${idx + 1}`}
                          className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      )}
                      {media.type === 'video' && (
                        <div className="w-full h-full flex items-center justify-center bg-chat-area">
                          <div className="text-center">
                            <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-chat-accent/20 flex items-center justify-center">
                              <svg className="w-5 h-5 text-chat-accent" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                            <span className="text-[10px] text-chat-muted">Video</span>
                          </div>
                        </div>
                      )}
                      {media.type === 'voice' && (
                        <div className="w-full h-full flex items-center justify-center bg-chat-area">
                          <div className="text-center">
                            <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-chat-accent/20 flex items-center justify-center">
                              <svg className="w-5 h-5 text-chat-accent" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-[10px] text-chat-muted">{media.duration}s</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* Shared Files */}
      {sharedFiles.length > 0 && (
      <div className="border-b border-chat-border dark:border-chat-border">
        <button
          onClick={() => toggleSection('files')}
          className="w-full p-4 flex items-center justify-between hover:bg-chat-area dark:hover:bg-chat-area transition-colors"
        >
          <h4 className="font-semibold text-chat-text dark:text-chat-text flex items-center gap-2">
            <FileIcon className="w-4 h-4" />
            Shared Files ({sharedFiles.length})
          </h4>
          {expandedSections.files ? (
            <ChevronUpIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.files && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  {sharedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-chat-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-5 h-5 text-chat-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-chat-text dark:text-chat-text truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-chat-muted dark:text-chat-muted">
                          {file.size}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* Shared Links */}
      {sharedLinks.length > 0 && (
      <div className="border-b border-chat-border dark:border-chat-border">
        <button
          onClick={() => toggleSection('links')}
          className="w-full p-4 flex items-center justify-between hover:bg-chat-area dark:hover:bg-chat-area transition-colors"
        >
          <h4 className="font-semibold text-chat-text dark:text-chat-text flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Shared Links ({sharedLinks.length})
          </h4>
          {expandedSections.links ? (
            <ChevronUpIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.links && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  {sharedLinks.slice(0, 5).map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors"
                    >
                      <p className="text-sm text-chat-accent truncate break-all">
                        {link}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* Group Members */}
      {isGroup &&
      <div className="p-4 border-b border-chat-border dark:border-chat-border">
          <h4 className="font-semibold text-chat-text dark:text-chat-text mb-3">
            Members ({members.length})
          </h4>
          <div className="space-y-2">
            {members.map((member) => {
            const isAdmin = chat.groupAdmins?.includes(member.id);
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors">
                
                  <div className="relative">
                    <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full" />
                  
                    {member.status === 'online' &&
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-chat-online border-2 border-chat-card dark:border-chat-card rounded-full" />
                  }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-chat-text dark:text-chat-text truncate">
                        {member.name}
                      </p>
                      {isAdmin &&
                    <CrownIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    }
                    </div>
                    <p className="text-xs text-chat-muted dark:text-chat-muted truncate">
                      {member.bio || member.status}
                    </p>
                  </div>
                </div>);

          })}
          </div>
        </div>
      }

      {/* Actions */}
      <div className="p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors text-left">
          <BellOffIcon className="w-5 h-5 text-chat-muted dark:text-chat-muted" />
          <span className="text-chat-text dark:text-chat-text">
            Mute notifications
          </span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors text-left">
          <FlagIcon className="w-5 h-5 text-chat-muted dark:text-chat-muted" />
          <span className="text-chat-text dark:text-chat-text">
            Report user
          </span>
        </button>
      </div>

      {/* Encryption Notice */}
      <div className="p-4 mx-4 mb-4 bg-chat-area dark:bg-chat-area rounded-lg">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-chat-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-chat-text dark:text-chat-text mb-1">
              End-to-end encrypted
            </p>
            <p className="text-xs text-chat-muted dark:text-chat-muted">
              Messages are secured with end-to-end encryption. Only you and the
              recipient can read them.
            </p>
          </div>
        </div>
      </div>
    </motion.div>);

}