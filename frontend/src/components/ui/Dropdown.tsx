import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, XIcon } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onClose?: () => void;
  align?: 'left' | 'right';
  width?: string;
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  searchable = false,
  searchPlaceholder = 'Search...',
  onClose,
  align = 'right',
  width = 'min-w-[160px]',
  className = ''
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [isOpen, onClose]);

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setIsOpen(false);
    onClose?.();
  };

  const positionClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            className={`absolute top-full mt-1 z-30 ${positionClass} ${width} ${className}`}
          >
            <div className="bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-xl shadow-lg overflow-hidden">
              {searchable && (
                <div className="p-2 border-b border-chat-border dark:border-chat-border">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-muted dark:text-chat-muted" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-1.5 bg-chat-area dark:bg-chat-area rounded-lg outline-none text-sm text-chat-text dark:text-chat-text placeholder-chat-muted dark:placeholder-chat-muted"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-chat-muted dark:text-chat-muted hover:text-chat-text dark:hover:text-chat-text"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="max-h-64 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-chat-muted dark:text-chat-muted text-center">
                    No results found
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        className={`w-full flex items-center !justify-start gap-3 px-4 py-2.5 hover:bg-chat-area dark:hover:bg-chat-area transition-colors text-left ${
                          item.disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        } ${
                          item.variant === 'danger'
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-chat-text dark:text-chat-text'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
