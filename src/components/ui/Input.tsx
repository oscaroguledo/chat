import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-chat-text dark:text-chat-text mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-muted dark:text-chat-muted">
            {leftIcon}
          </div>
        )}
        <input
          className={`
            w-full bg-chat-area dark:bg-chat-area 
            border ${error ? 'border-red-500' : 'border-chat-border dark:border-chat-border'} 
            rounded-lg outline-none 
            text-chat-text dark:text-chat-text 
            placeholder-chat-muted dark:placeholder-chat-muted
            transition-colors
            focus:border-chat-accent focus:ring-1 focus:ring-chat-accent
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-2.5
            ${className}
          `.trim()}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-chat-muted dark:text-chat-muted">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-chat-muted dark:text-chat-muted">{helperText}</p>
      )}
    </div>
  );
}
