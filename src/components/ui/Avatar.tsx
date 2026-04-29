import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  isOnline,
  className = ''
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };
  
  const statusSizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={`${sizeClasses[size]} rounded-full object-cover bg-chat-area`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-chat-accent flex items-center justify-center text-white font-medium`}
        >
          {name ? getInitials(name) : '?'}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          } border-2 border-chat-card dark:border-chat-card rounded-full`}
        />
      )}
    </div>
  );
}
