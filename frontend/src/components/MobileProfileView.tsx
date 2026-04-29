import React from 'react';
import { currentUser } from '@/data/mockData';
import { CameraIcon, PencilIcon } from 'lucide-react';
export function MobileProfileView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-chat-bg dark:bg-chat-bg">
      <div className="p-4 bg-chat-card dark:bg-chat-card border-b border-chat-border dark:border-chat-border">
        <h2 className="text-lg font-semibold text-chat-text dark:text-chat-text">
          Profile
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center py-8 bg-chat-card dark:bg-chat-card">
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

        {/* Info Fields */}
        <div className="mt-4 bg-chat-card dark:bg-chat-card">
          <div className="px-4 py-3.5 border-b border-chat-border/50 dark:border-chat-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-chat-muted dark:text-chat-muted mb-0.5">
                  Display Name
                </p>
                <p className="text-sm font-medium text-chat-text dark:text-chat-text">
                  {currentUser.name}
                </p>
              </div>
              <PencilIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
            </div>
          </div>
          <div className="px-4 py-3.5 border-b border-chat-border/50 dark:border-chat-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-chat-muted dark:text-chat-muted mb-0.5">
                  Bio
                </p>
                <p className="text-sm font-medium text-chat-text dark:text-chat-text">
                  Hey there! I'm using ChatApp
                </p>
              </div>
              <PencilIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
            </div>
          </div>
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-chat-muted dark:text-chat-muted mb-0.5">
                  Phone
                </p>
                <p className="text-sm font-medium text-chat-text dark:text-chat-text">
                  +1 (555) 123-4567
                </p>
              </div>
              <PencilIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>);

}