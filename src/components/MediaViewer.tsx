import React, { useEffect, Component } from 'react';
import { XIcon, DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
interface MediaViewerProps {
  type: 'image' | 'pdf';
  url: string;
  title?: string;
  onClose: () => void;
}
export function MediaViewer({ type, url, title, onClose }: MediaViewerProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  const pdfViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  return (
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
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={onClose}>
      
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-black/50"
        onClick={(e) => e.stopPropagation()}>
        
        <h3 className="text-white text-sm font-medium truncate flex-1 mr-4">
          {title || (type === 'image' ? 'Image' : 'Document')}
        </h3>
        <div className="flex items-center gap-2">
          {type === 'pdf' &&
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            title="Open in new tab">
            
              <ExternalLinkIcon className="w-5 h-5" />
            </a>
          }
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            title="Download">
            
            <DownloadIcon className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
            
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden p-4 min-h-0"
        onClick={(e) => e.stopPropagation()}>
        
        {type === 'image' ?
        <motion.img
          initial={{
            scale: 0.9
          }}
          animate={{
            scale: 1
          }}
          src={url}
          alt={title || 'Image'}
          className="max-w-full max-h-full object-contain rounded-lg" /> :


        <div className="w-full h-full max-w-4xl flex flex-col">
            <iframe
            src={pdfViewerUrl}
            title={title || 'Document'}
            className="w-full flex-1 bg-white rounded-lg border-0"
            sandbox="allow-scripts allow-same-origin allow-popups" />
          
          </div>
        }
      </div>
    </motion.div>);

}