import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export function Card({
  children,
  padding = 'md',
  shadow = 'sm',
  border = true,
  className = '',
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };
  
  const classes = `
    bg-chat-card dark:bg-chat-card
    rounded-xl
    ${border ? 'border border-chat-border dark:border-chat-border' : ''}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${className}
  `.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`} {...props}>
      <div>
        {title && (
          <h3 className="font-semibold text-chat-text dark:text-chat-text">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-chat-muted dark:text-chat-muted mt-0.5">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
