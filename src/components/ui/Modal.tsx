import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={closeOnBackdrop ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-chat-card dark:bg-chat-card rounded-2xl w-full ${sizeClasses[size]} overflow-hidden shadow-2xl`}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-chat-border dark:border-chat-border">
                {title && (
                  <h3 className="font-semibold text-chat-text dark:text-chat-text">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-chat-area dark:hover:bg-chat-area rounded-lg transition-colors text-chat-muted dark:text-chat-muted"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
