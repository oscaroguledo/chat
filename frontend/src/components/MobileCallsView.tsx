import React, { useState } from 'react';
import {
  PhoneIcon,
  VideoIcon,
  PhoneIncomingIcon,
  PhoneOutgoingIcon,
  PhoneMissedIcon } from
'lucide-react';
import { users } from '@/data/mockData';
import { CallType } from './CallModal';
interface MobileCallsViewProps {
  onStartCall: (
  contactName: string,
  contactAvatar: string,
  callType: CallType)
  => void;
}
interface CallLog {
  id: string;
  contactId: string;
  type: CallType;
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: Date;
  duration?: string;
}
const mockCallLogs: CallLog[] = [
{
  id: 'call-1',
  contactId: 'user-2',
  type: 'video',
  direction: 'incoming',
  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  duration: '12:34'
},
{
  id: 'call-2',
  contactId: 'user-3',
  type: 'voice',
  direction: 'missed',
  timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
},
{
  id: 'call-3',
  contactId: 'user-4',
  type: 'voice',
  direction: 'outgoing',
  timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  duration: '5:21'
},
{
  id: 'call-4',
  contactId: 'user-7',
  type: 'video',
  direction: 'outgoing',
  timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  duration: '45:02'
},
{
  id: 'call-5',
  contactId: 'user-5',
  type: 'voice',
  direction: 'incoming',
  timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  duration: '2:15'
},
{
  id: 'call-6',
  contactId: 'user-8',
  type: 'voice',
  direction: 'missed',
  timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
},
{
  id: 'call-7',
  contactId: 'user-6',
  type: 'video',
  direction: 'incoming',
  timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  duration: '18:47'
}];

export function MobileCallsView({ onStartCall }: MobileCallsViewProps) {
  const [filter, setFilter] = useState<'all' | 'missed'>('all');
  const filteredLogs =
  filter === 'missed' ?
  mockCallLogs.filter((c) => c.direction === 'missed') :
  mockCallLogs;
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
    if (days === 1) return 'Yesterday';
    if (days < 7)
    return date.toLocaleDateString('en-US', {
      weekday: 'short'
    });
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  const DirectionIcon = ({ direction }: {direction: string;}) => {
    if (direction === 'incoming')
    return <PhoneIncomingIcon className="w-4 h-4 text-chat-online" />;
    if (direction === 'outgoing')
    return <PhoneOutgoingIcon className="w-4 h-4 text-chat-accent" />;
    return <PhoneMissedIcon className="w-4 h-4 text-red-500" />;
  };
  return (
    <div className="flex-1 flex flex-col h-full bg-chat-card dark:bg-chat-card">
      {/* Header */}
      <div className="p-4 border-b border-chat-border dark:border-chat-border">
        <h2 className="text-lg font-semibold text-chat-text dark:text-chat-text mb-3">
          Calls
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-chat-accent text-white' : 'bg-chat-area dark:bg-chat-area text-chat-text dark:text-chat-text'}`}>
            
            All
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'missed' ? 'bg-chat-accent text-white' : 'bg-chat-area dark:bg-chat-area text-chat-text dark:text-chat-text'}`}>
            
            Missed
          </button>
        </div>
      </div>

      {/* Call logs */}
      <div className="flex-1 overflow-y-auto">
        {filteredLogs.map((call) => {
          const contact = users[call.contactId];
          if (!contact) return null;
          const isMissed = call.direction === 'missed';
          return (
            <div
              key={call.id}
              className="flex items-center gap-3 p-4 hover:bg-chat-area dark:hover:bg-chat-area transition-colors">
              
              <div className="relative flex-shrink-0">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full" />
                
                {contact.status === 'online' &&
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-chat-online border-2 border-chat-card dark:border-chat-card rounded-full" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className={`font-semibold truncate ${isMissed ? 'text-red-500' : 'text-chat-text dark:text-chat-text'}`}>
                  
                  {contact.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <DirectionIcon direction={call.direction} />
                  <span className="text-xs text-chat-muted dark:text-chat-muted">
                    {formatTime(call.timestamp)}
                    {call.duration && ` · ${call.duration}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() =>
                  onStartCall(contact.name, contact.avatar, 'voice')
                  }
                  className="p-2 hover:bg-chat-area dark:hover:bg-chat-border/50 rounded-lg transition-colors text-chat-online">
                  
                  <PhoneIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                  onStartCall(contact.name, contact.avatar, 'video')
                  }
                  className="p-2 hover:bg-chat-area dark:hover:bg-chat-border/50 rounded-lg transition-colors text-chat-accent">
                  
                  <VideoIcon className="w-5 h-5" />
                </button>
              </div>
            </div>);

        })}

        {filteredLogs.length === 0 &&
        <div className="flex flex-col items-center justify-center py-16 text-chat-muted dark:text-chat-muted">
            <PhoneMissedIcon className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">No missed calls</p>
          </div>
        }
      </div>
    </div>);

}