import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XIcon, 
  DownloadIcon, 
  FileIcon, 
  FileTextIcon,
  FileImageIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileSpreadsheetIcon,
  FileTypeIcon
} from 'lucide-react';

export interface FileViewerProps {
  url: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export function FileViewer({ url, fileName, fileSize, fileType, isOpen, onClose, onDownload }: FileViewerProps) {
  const getFileIcon = () => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <FileImageIcon className="w-16 h-16 text-blue-500" />;
    }
    if (['mp4', 'avi', 'mov', 'webm', 'mkv'].includes(extension || '')) {
      return <FileVideoIcon className="w-16 h-16 text-purple-500" />;
    }
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(extension || '')) {
      return <FileAudioIcon className="w-16 h-16 text-orange-500" />;
    }
    if (['pdf'].includes(extension || '')) {
      return <FileTextIcon className="w-16 h-16 text-red-500" />;
    }
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return <FileTypeIcon className="w-16 h-16 text-blue-600" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(extension || '')) {
      return <FileSpreadsheetIcon className="w-16 h-16 text-green-500" />;
    }
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c'].includes(extension || '')) {
      return <FileCodeIcon className="w-16 h-16 text-yellow-500" />;
    }
    
    return <FileIcon className="w-16 h-16 text-chat-muted" />;
  };

  const extension = fileName.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-chat-card dark:bg-chat-card rounded-2xl w-full max-w-md p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-chat-text dark:text-chat-text">
                File
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors text-chat-muted dark:text-chat-muted"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* File Icon */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {getFileIcon()}
                <div className="absolute -bottom-1 -right-1 bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded px-1.5 py-0.5">
                  <span className="text-xs font-medium text-chat-muted dark:text-chat-muted">
                    {extension}
                  </span>
                </div>
              </div>
            </div>

            {/* File Info */}
            <div className="text-center mb-6">
              <p className="font-medium text-chat-text dark:text-chat-text break-all mb-1">
                {fileName}
              </p>
              {fileSize && (
                <p className="text-sm text-chat-muted dark:text-chat-muted">
                  {fileSize}
                </p>
              )}
              {fileType && (
                <p className="text-xs text-chat-muted dark:text-chat-muted mt-1">
                  {fileType}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-medium text-chat-text dark:text-chat-text hover:bg-chat-area dark:hover:bg-chat-area rounded-xl transition-colors"
              >
                Close
              </button>
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="flex-1 px-4 py-3 text-sm font-medium bg-chat-accent text-white hover:bg-chat-accent/90 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
