import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  variant?: 'default' | 'area';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      resize = 'none',
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'w-full outline-none text-chat-text dark:text-chat-text placeholder-chat-muted dark:placeholder-chat-muted';
    
    const variantClasses = {
      default: 'px-1 py-1 bg-chat-card dark:bg-chat-card border border-chat-border dark:border-chat-border rounded-lg',
      area: 'px-1 py-1  rounded-lg'
    };
    
    const resizeClasses = {
      none: 'resize-none',
      both: 'resize',
      horizontal: 'resize-x',
      vertical: 'resize-y'
    };
    
    const classes = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${resizeClasses[resize]}
      ${className}
    `.trim();

    return <textarea ref={ref} className={classes} {...props} />;
  }
);

Textarea.displayName = 'Textarea';
