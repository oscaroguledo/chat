import React, { useState, useRef } from 'react';
import { Message, users, currentUser } from '../data/mockData';
import {
  CheckIcon,
  CheckCheckIcon,
  FileIcon,
  FileTextIcon,
  DownloadIcon,
  EyeIcon,
  ReplyIcon,
  SmilePlusIcon,
  PinIcon,
  MessageSquareIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioPlayer } from './ui/AudioPlayer';
import { MediaViewer } from './MediaViewer';
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showSenderName?: boolean;
  replyToMessage?: Message;
  onReply?: (message: Message) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onScrollToMessage?: (messageId: string) => void;
  isPinned?: boolean;
  isGroupChat?: boolean;
  onReplyPrivately?: (message: Message) => void;
}
const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
// YouTube URL detection
function getYouTubeId(text: string): string | null {
  const patterns = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}
function isYouTubeUrl(text: string): boolean {
  return getYouTubeId(text) !== null;
}
export function MessageBubble({
  message,
  isOwnMessage,
  showSenderName,
  replyToMessage,
  onReply,
  onReact,
  onPin,
  onScrollToMessage,
  isPinned,
  isGroupChat,
  onReplyPrivately
}: MessageBubbleProps) {
  const sender = users[message.senderId];
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerType, setViewerType] = useState<'image' | 'pdf'>('image');
  const [viewerUrl, setViewerUrl] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const openViewer = (type: 'image' | 'pdf', url: string) => {
    setViewerType(type);
    setViewerUrl(url);
    setViewerOpen(true);
  };
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setShowActions(true), 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  const handleReact = (emoji: string) => {
    onReact?.(message.id, emoji);
    setShowReactionPicker(false);
    setShowActions(false);
  };
  const handleReply = () => {
    onReply?.(message);
    setShowActions(false);
  };
  const handlePin = () => {
    onPin?.(message.id);
    setShowActions(false);
  };
  const handleReplyPrivately = () => {
    onReplyPrivately?.(message);
    setShowActions(false);
  };
  const getStatusIcon = () => {
    if (!message.status) return null;
    if (message.status === 'sent') {
      return (
        <CheckIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />);

    }
    const iconClass =
    message.status === 'read' ?
    'text-chat-accent' :
    'text-chat-muted dark:text-chat-muted';
    return <CheckCheckIcon className={`w-4 h-4 ${iconClass}`} />;
  };
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  const isPdf = message.fileName?.toLowerCase().endsWith('.pdf');
  const youtubeId =
  message.type === 'text' ? getYouTubeId(message.content) : null;
  const renderMessageContent = () => {
    // YouTube embed for text messages containing YouTube URLs
    if (message.type === 'text' && youtubeId) {
      return (
        <div
          className={`rounded-2xl overflow-hidden ${isOwnMessage ? 'bg-chat-sent text-white dark:bg-chat-sent' : 'bg-chat-card text-chat-text dark:bg-chat-card dark:text-chat-text'}`}>
          
          <div className="aspect-video w-full max-w-sm">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0" />
            
          </div>
          <div className="px-4 py-2">
            <p className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </p>
          </div>
        </div>);

    }
    switch (message.type) {
      case 'image':
        return (
          <button
            onClick={() => openViewer('image', message.imageUrl || '')}
            className="rounded-lg overflow-hidden max-w-sm block cursor-pointer group">
            
            <div className="relative">
              <img
                src={message.imageUrl}
                alt={message.content || 'Shared image'}
                className="w-full h-auto max-h-64 object-cover group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
                  <EyeIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            {message.content &&
            <div
              className={`px-3 py-2 text-sm ${isOwnMessage ? 'bg-chat-sent text-white dark:bg-chat-sent' : 'bg-chat-card text-chat-text dark:bg-chat-card dark:text-chat-text'}`}>
              
                {message.content}
              </div>
            }
          </button>);

      case 'video':
        return (
          <div className="rounded-lg overflow-hidden max-w-sm">
            <video
              src={message.videoUrl}
              controls
              preload="metadata"
              className="w-full h-auto max-h-64 bg-black rounded-lg"
              controlsList="nodownload">
              
              Your browser does not support the video tag.
            </video>
            {message.content &&
            <div
              className={`px-3 py-2 text-sm ${isOwnMessage ? 'bg-chat-sent text-white dark:bg-chat-sent' : 'bg-chat-card text-chat-text dark:bg-chat-card dark:text-chat-text'}`}>
              
                {message.content}
              </div>
            }
          </div>);

      case 'voice':
        return (
          <AudioPlayer
            url={message.voiceUrl || ''}
            duration={message.voiceDuration}
            variant={isOwnMessage ? 'primary' : 'secondary'} />);


      case 'file':
        return (
          <div
            className={`rounded-2xl overflow-hidden ${isOwnMessage ? 'bg-chat-sent text-white dark:bg-chat-sent' : 'bg-chat-card text-chat-text dark:bg-chat-card dark:text-chat-text'}`}>
            
            <div className="flex items-center gap-3 px-4 py-3">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isOwnMessage ? 'bg-white/20' : 'bg-chat-area dark:bg-chat-area'}`}>
                
                {isPdf ?
                <FileTextIcon className="w-5 h-5 text-red-400" /> :

                <FileIcon className="w-5 h-5" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">
                  {message.fileName}
                </p>
                <p className="text-xs opacity-70">{message.fileSize}</p>
              </div>
            </div>
            <div
              className={`flex border-t ${isOwnMessage ? 'border-white/10' : 'border-chat-border dark:border-chat-border'}`}>
              
              {isPdf && message.fileUrl &&
              <button
                onClick={() => openViewer('pdf', message.fileUrl || '')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${isOwnMessage ? 'hover:bg-white/10' : 'hover:bg-chat-area dark:hover:bg-chat-area'}`}>
                
                  <EyeIcon className="w-3.5 h-3.5" /> View
                </button>
              }
              {message.fileUrl &&
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${isPdf ? isOwnMessage ? 'border-l border-white/10 hover:bg-white/10' : 'border-l border-chat-border dark:border-chat-border hover:bg-chat-area dark:hover:bg-chat-area' : isOwnMessage ? 'hover:bg-white/10' : 'hover:bg-chat-area dark:hover:bg-chat-area'}`}>
                
                  <DownloadIcon className="w-3.5 h-3.5" /> Download
                </a>
              }
            </div>
          </div>);

      default:
        return (
          <div
            className={`px-4 py-2 rounded-2xl ${isOwnMessage ? 'bg-chat-sent text-white dark:bg-chat-sent' : 'bg-chat-card text-chat-text dark:bg-chat-card dark:text-chat-text'}`}>
            
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>);

    }
  };
  return (
    <>
      <motion.div
        id={`message-${message.id}`}
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.2
        }}
        className={`flex gap-2 mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        
        {!isOwnMessage &&
        <img
          src={sender.avatar}
          alt={sender.name}
          className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />

        }

        <div
          className={`flex flex-col max-w-[75%] md:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          
          {showSenderName && !isOwnMessage &&
          <span className="text-xs text-chat-muted dark:text-chat-muted mb-1 px-1">
              {sender.name}
            </span>
          }

          {/* Reply quote — clickable to scroll to original */}
          {replyToMessage &&
          <button
            onClick={() => onScrollToMessage?.(replyToMessage.id)}
            className={`mb-1 px-3 py-2 rounded-lg text-sm border-l-2 max-w-full text-left cursor-pointer hover:opacity-80 transition-opacity ${isOwnMessage ? 'bg-slate-600 border-slate-400 text-white' : 'bg-slate-100 dark:bg-slate-700 border-chat-accent text-chat-text dark:text-chat-text'}`}>
            
              <p className="font-medium text-xs opacity-70 mb-0.5">
                {users[replyToMessage.senderId].name}
              </p>
              <p className="opacity-80 truncate">{replyToMessage.content}</p>
            </button>
          }

          {/* Message content + hover actions */}
          <div
            ref={bubbleRef}
            className="relative group"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}>
            
            {renderMessageContent()}

            {/* Desktop hover actions */}
            <div
              className={`absolute top-0 hidden md:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isOwnMessage ? 'right-full mr-1' : 'left-full ml-1'}`}>
              
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="p-1.5 bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-lg shadow-sm hover:bg-chat-area dark:hover:bg-chat-area transition-colors text-chat-muted dark:text-chat-muted"
                title="React">
                
                <SmilePlusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleReply}
                className="p-1.5 bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-lg shadow-sm hover:bg-chat-area dark:hover:bg-chat-area transition-colors text-chat-muted dark:text-chat-muted"
                title="Reply">
                
                <ReplyIcon className="w-4 h-4" />
              </button>
              {isGroupChat && !isOwnMessage && (
                <button
                  onClick={handleReplyPrivately}
                  className="p-1.5 bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-lg shadow-sm hover:bg-chat-area dark:hover:bg-chat-area transition-colors text-chat-muted dark:text-chat-muted"
                  title="Reply privately">
                  
                  <MessageSquareIcon className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handlePin}
                className={`p-1.5 bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-lg shadow-sm hover:bg-chat-area dark:hover:bg-chat-area transition-colors ${isPinned ? 'text-chat-accent' : 'text-chat-muted dark:text-chat-muted'}`}
                title={isPinned ? 'Unpin' : 'Pin'}>
                
                <PinIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop reaction picker */}
            <AnimatePresence>
              {showReactionPicker &&
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 5
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  y: 5
                }}
                className={`absolute bottom-full mb-2 z-20 hidden md:flex items-center gap-1 bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-full px-2 py-1.5 shadow-lg ${isOwnMessage ? 'right-0' : 'left-0'}`}>
                
                  {quickReactions.map((emoji) =>
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-chat-area dark:hover:bg-chat-area rounded-full transition-colors hover:scale-125">
                  
                      {emoji}
                    </button>
                )}
                </motion.div>
              }
            </AnimatePresence>

            {/* Reactions display */}
            {message.reactions && message.reactions.length > 0 &&
            <div
              className={`absolute -bottom-3 flex gap-1 ${isOwnMessage ? 'right-2' : 'left-2'}`}>
              
                {message.reactions.map((reaction, idx) =>
              <button
                key={idx}
                onClick={() => handleReact(reaction.emoji)}
                className="bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-full px-2 py-0.5 text-xs shadow-sm hover:bg-chat-area dark:hover:bg-chat-area transition-colors cursor-pointer">
                
                    {reaction.emoji} {reaction.userIds.length}
                  </button>
              )}
              </div>
            }
          </div>

          <div
            className={`flex items-center gap-1 px-1 ${message.reactions && message.reactions.length > 0 ? 'mt-4' : 'mt-1'}`}>
            
            {isPinned && <PinIcon className="w-3 h-3 text-chat-accent" />}
            <span className="text-xs text-chat-muted dark:text-chat-muted">
              {formatTime(message.timestamp)}
            </span>
            {message.edited &&
            <span className="text-xs text-chat-muted dark:text-chat-muted italic">
                (edited)
              </span>
            }
            {isOwnMessage && getStatusIcon()}
          </div>
        </div>
      </motion.div>

      {/* Mobile action sheet */}
      <AnimatePresence>
        {showActions &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setShowActions(false)}>
          
            <motion.div
            initial={{
              y: '100%'
            }}
            animate={{
              y: 0
            }}
            exit={{
              y: '100%'
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="absolute bottom-0 left-0 right-0 bg-chat-card dark:bg-chat-card rounded-t-2xl overflow-hidden safe-area-bottom"
            onClick={(e) => e.stopPropagation()}>
            
              <div className="flex items-center justify-center gap-3 px-4 pt-5 pb-3">
                {quickReactions.map((emoji) =>
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="w-11 h-11 flex items-center justify-center text-2xl hover:bg-chat-area dark:hover:bg-chat-area rounded-full transition-all active:scale-110">
                
                    {emoji}
                  </button>
              )}
              </div>
              <div className="border-t border-chat-border dark:border-chat-border">
                <button
                onClick={handleReply}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-chat-area dark:hover:bg-chat-area transition-colors text-left">
                
                  <ReplyIcon className="w-5 h-5 text-chat-muted dark:text-chat-muted" />
                  <span className="text-sm font-medium text-chat-text dark:text-chat-text">
                    Reply
                  </span>
                </button>
                {isGroupChat && !isOwnMessage && (
                  <button
                  onClick={handleReplyPrivately}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-chat-area dark:hover:bg-chat-area transition-colors text-left">
                  
                    <MessageSquareIcon className="w-5 h-5 text-chat-muted dark:text-chat-muted" />
                    <span className="text-sm font-medium text-chat-text dark:text-chat-text">
                      Reply privately
                    </span>
                  </button>
                )}
                <button
                onClick={handlePin}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-chat-area dark:hover:bg-chat-area transition-colors text-left">
                
                  <PinIcon
                  className={`w-5 h-5 ${isPinned ? 'text-chat-accent' : 'text-chat-muted dark:text-chat-muted'}`} />
                
                  <span className="text-sm font-medium text-chat-text dark:text-chat-text">
                    {isPinned ? 'Unpin message' : 'Pin message'}
                  </span>
                </button>
                <button
                onClick={() => {
                  setShowActions(false);
                  setShowReactionPicker(true);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-chat-area dark:hover:bg-chat-area transition-colors text-left">
                
                  <SmilePlusIcon className="w-5 h-5 text-chat-muted dark:text-chat-muted" />
                  <span className="text-sm font-medium text-chat-text dark:text-chat-text">
                    More reactions
                  </span>
                </button>
              </div>
              <div className="border-t border-chat-border dark:border-chat-border p-3">
                <button
                onClick={() => setShowActions(false)}
                className="w-full py-3 text-center text-sm font-medium text-chat-muted dark:text-chat-muted hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors">
                
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {viewerOpen &&
        <MediaViewer
          type={viewerType}
          url={viewerUrl}
          title={message.fileName || message.content}
          onClose={() => setViewerOpen(false)} />

        }
      </AnimatePresence>
    </>);

}