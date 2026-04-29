import React from 'react';
import { Chat, users, currentUser, sharedMedia } from '../data/mockData';
import {
  XIcon,
  BellOffIcon,
  FlagIcon,
  ShieldCheckIcon,
  CrownIcon,
  ArrowLeftIcon } from
'lucide-react';
import { motion } from 'framer-motion';
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
      <div className="p-4 border-b border-chat-border dark:border-chat-border">
        <h4 className="font-semibold text-chat-text dark:text-chat-text mb-3">
          Shared Media
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {sharedMedia.slice(0, 6).map((url, idx) =>
          <div
            key={idx}
            className="aspect-square rounded-lg overflow-hidden bg-chat-area dark:bg-chat-area">
            
              <img
              src={url}
              alt={`Shared media ${idx + 1}`}
              className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
            
            </div>
          )}
        </div>
      </div>

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