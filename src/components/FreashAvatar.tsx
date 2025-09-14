'use client';

import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface FreshAvatarProps {
  src: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function FreshAvatar({ 
  src, 
  alt = "Profile", 
  className = "", 
  size = "md" 
}: FreshAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage 
        src={src || '/avatar.png'} 
        alt={alt}
        onError={(e) => {
          e.currentTarget.src = '/avatar.png';
        }}
      />
      <AvatarFallback>{alt?.charAt(0) || 'U'}</AvatarFallback>
    </Avatar>
  );
}