import React, { useState } from 'react';
import { users, currentUser } from '@/data/mockData';
import { SearchIcon } from 'lucide-react';
export function MobileContactsView() {
  const [filter, setFilter] = useState<'all' | 'blocked'>('all');
  const contactList = Object.values(users).filter(
    (u) => u.id !== currentUser.id
  );
  const blockedContactIds: string[] = []; // TODO: Add blocked contacts to mockData
  const filteredContacts = filter === 'blocked'
    ? contactList.filter(u => blockedContactIds.includes(u.id))
    : contactList;
  return (
    <div className="flex-1 flex flex-col h-full bg-chat-card dark:bg-chat-card">
      <div className="p-4 border-b border-chat-border dark:border-chat-border">
        <h2 className="text-lg font-semibold text-chat-text dark:text-chat-text mb-3">
          Contacts
        </h2>
        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-muted dark:text-chat-muted" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 bg-chat-area dark:bg-chat-area rounded-lg outline-none text-sm text-chat-text dark:text-chat-text placeholder-chat-muted dark:placeholder-chat-muted" />
          
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-chat-accent text-white' : 'bg-chat-area dark:bg-chat-area text-chat-text dark:text-chat-text'}`}>
            All
          </button>
          <button
            onClick={() => setFilter('blocked')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'blocked' ? 'bg-red-500 text-white' : 'bg-chat-area dark:bg-chat-area text-chat-text dark:text-chat-text'}`}>
            Blocked
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-chat-muted dark:text-chat-muted">
            <p className="text-sm">No {filter === 'blocked' ? 'blocked contacts' : 'contacts'}</p>
          </div>
        ) : filteredContacts.map((user) =>
        <div
          key={user.id}
          className="flex items-center gap-3 p-4 hover:bg-chat-area dark:hover:bg-chat-area transition-colors">
          
            <div className="relative flex-shrink-0">
              <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full" />
            
              {user.status === 'online' &&
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-chat-online border-2 border-chat-card dark:border-chat-card rounded-full" />
            }
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-chat-text dark:text-chat-text">
                {user.name}
              </h4>
              <p className="text-sm text-chat-muted dark:text-chat-muted truncate">
                {user.bio || (
              user.status === 'online' ?
              'Online' :
              `Last seen ${user.lastSeen}`)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>);

}