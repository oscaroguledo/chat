import React, { useEffect, useState, useRef } from 'react';
import {
  SmileIcon,
  PaperclipIcon,
  SendIcon,
  XIcon,
  ImageIcon,
  VideoIcon,
  FileIcon,
  MicIcon,
  SquareIcon } from
'lucide-react';
import { Message } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { EmojiPicker } from './EmojiPicker';
interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendVoice?: (duration: number) => void;
  replyingTo?: Message;
  onCancelReply?: () => void;
}
export function MessageInput({
  onSendMessage,
  onSendVoice,
  replyingTo,
  onCancelReply
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    textareaRef.current?.focus();
  };
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };
  const stopRecording = (send: boolean) => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    if (send && recordingTime > 0) {
      onSendVoice?.(recordingTime);
    }
    setRecordingTime(0);
  };
  const formatRecordingTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAttachMenu(false);
      setShowEmojiPicker(false);
    };
    if (showAttachMenu || showEmojiPicker) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAttachMenu, showEmojiPicker]);
  useEffect(() => {
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, []);
  const hasText = message.trim().length > 0;
  return (
    <div className="bg-transparent flex-shrink-0 px-2 pb-2 md:px-4 md:pb-3 pt-1">
      {/* Reply preview */}
      <AnimatePresence>
        {replyingTo &&
        <motion.div
          initial={{
            height: 0,
            opacity: 0
          }}
          animate={{
            height: 'auto',
            opacity: 1
          }}
          exit={{
            height: 0,
            opacity: 0
          }}
          className="mb-1">
          
            <div className="bg-chat-card dark:bg-chat-card rounded-t-2xl border border-b-0 border-chat-border dark:border-chat-border px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 border-l-2 border-chat-accent pl-3">
                  <p className="text-xs text-chat-accent font-semibold">
                    Reply
                  </p>
                  <p className="text-sm text-chat-text dark:text-chat-text truncate">
                    {replyingTo.content}
                  </p>
                </div>
                <button
                onClick={onCancelReply}
                className="ml-2 p-1 hover:bg-chat-area dark:hover:bg-chat-area rounded-full transition-colors">
                
                  <XIcon className="w-4 h-4 text-chat-muted dark:text-chat-muted" />
                </button>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Recording state */}
      <AnimatePresence>
        {isRecording &&
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          exit={{
            opacity: 0,
            scale: 0.95
          }}
          className="flex items-center gap-3 bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-full px-4 py-2.5 shadow-sm">
          
            <button
            onClick={() => stopRecording(false)}
            className="p-1.5 hover:bg-chat-area dark:hover:bg-chat-area rounded-full transition-colors text-red-500">
            
              <XIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 flex-1">
              <motion.div
              animate={{
                opacity: [1, 0.3, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity
              }}
              className="w-3 h-3 bg-red-500 rounded-full" />
            
              <span className="text-sm font-medium text-chat-text dark:text-chat-text font-mono">
                {formatRecordingTime(recordingTime)}
              </span>
              <div className="flex-1 flex items-center gap-0.5 px-2">
                {Array.from({
                length: 24
              }).map((_, i) =>
              <motion.div
                key={i}
                animate={{
                  height: [4, Math.random() * 16 + 4, 4]
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: i * 0.05
                }}
                className="w-1 bg-chat-accent/60 rounded-full"
                style={{
                  minHeight: 4
                }} />

              )}
              </div>
            </div>

            <button
            onClick={() => stopRecording(true)}
            className="p-2.5 bg-chat-accent hover:bg-chat-accent/90 rounded-full transition-colors text-white">
            
              <SendIcon className="w-5 h-5" />
            </button>
          </motion.div>
        }
      </AnimatePresence>

      {/* Main input bar — Telegram style */}
      {!isRecording &&
      <div className={`flex items-end gap-2 ${replyingTo ? '' : ''}`}>
          {/* Unified input container */}
          <div
          className={`flex-1 flex items-end bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border shadow-sm ${replyingTo ? 'rounded-b-2xl' : 'rounded-full'} overflow-hidden`}>
          
            {/* Emoji */}
            <div
            className="relative flex-shrink-0"
            onClick={(e) => e.stopPropagation()}>
            
              <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className={`p-2.5 transition-colors ${showEmojiPicker ? 'text-chat-accent' : 'text-chat-muted dark:text-chat-muted hover:text-chat-text dark:hover:text-chat-text'}`}>
              
                <SmileIcon className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showEmojiPicker &&
              <EmojiPicker
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)} />

              }
              </AnimatePresence>
            </div>

            {/* Text input */}
            <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message"
            className="flex-1 py-2.5 bg-transparent resize-none outline-none text-chat-text dark:text-chat-text placeholder-chat-muted dark:placeholder-chat-muted text-sm leading-5 max-h-28"
            rows={1} />
          

            {/* Attach */}
            <div
            className="relative flex-shrink-0"
            onClick={(e) => e.stopPropagation()}>
            
              <button
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              className="p-2.5 text-chat-muted dark:text-chat-muted hover:text-chat-text dark:hover:text-chat-text transition-colors">
              
                <PaperclipIcon className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showAttachMenu &&
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }}
                className="absolute bottom-full right-0 mb-2 bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-xl shadow-lg overflow-hidden z-30 min-w-[160px]">
                
                    {[
                {
                  icon: ImageIcon,
                  label: 'Photo',
                  color: 'text-blue-500'
                },
                {
                  icon: VideoIcon,
                  label: 'Video',
                  color: 'text-purple-500'
                },
                {
                  icon: FileIcon,
                  label: 'File',
                  color: 'text-green-500'
                }].
                map(({ icon: Icon, label, color }) =>
                <button
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-chat-area dark:hover:bg-chat-area transition-colors w-full text-left">
                  
                        <Icon className={`w-5 h-5 ${color}`} />
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

          {/* Send or Mic button */}
          <motion.button
          key={hasText ? 'send' : 'mic'}
          initial={{
            scale: 0.8,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          transition={{
            duration: 0.15
          }}
          onClick={hasText ? handleSend : startRecording}
          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-sm ${hasText ? 'bg-chat-accent hover:bg-chat-accent/90 text-white' : 'bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border text-chat-muted dark:text-chat-muted hover:text-chat-accent'}`}>
          
            {hasText ?
          <SendIcon className="w-5 h-5" /> :

          <MicIcon className="w-5 h-5" />
          }
          </motion.button>
        </div>
      }
    </div>);

}