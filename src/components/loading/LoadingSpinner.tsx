import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  text,
  className,
  ...props 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-500',
    secondary: 'text-purple-500',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)} {...props}>
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )} 
      />
      {text && (
        <p className={cn(
          'mt-2 text-sm',
          color === 'white' ? 'text-white' : 'text-gray-400'
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  className?: string;
}

export function LoadingOverlay({ isVisible, text = 'Loading...', className }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
      className
    )}>
      <LoadingSpinner 
        size="lg" 
        text={text}
        className="bg-gray-900 border border-gray-700 rounded-lg p-6"
      />
    </div>
  );
}