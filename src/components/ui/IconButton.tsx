import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

export function IconButton({
  children,
  variant = 'default',
  size = 'md',
  isActive = false,
  className = '',
  ...props
}: IconButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'text-chat-muted dark:text-chat-muted hover:bg-chat-area dark:hover:bg-chat-area',
    ghost: 'text-chat-text dark:text-chat-text hover:bg-chat-area dark:hover:bg-chat-area',
    primary: 'text-chat-accent hover:bg-chat-accent/10',
    danger: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
  };
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  const activeClasses = isActive ? 'bg-chat-area dark:bg-chat-area text-chat-accent' : '';
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${activeClasses}
    ${className}
  `.trim();

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
