import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list' | 'chart';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Skeleton({ 
  className, 
  variant = 'text', 
  size = 'md',
  ...props 
}: SkeletonProps) {
  const variantClasses = {
    text: 'animate-pulse bg-gray-700 rounded',
    circular: 'animate-pulse bg-gray-700 rounded-full',
    rectangular: 'animate-pulse bg-gray-700 rounded',
    card: 'animate-pulse bg-gray-800 rounded-lg border border-gray-700',
    list: 'animate-pulse bg-gray-700 rounded-md',
    chart: 'animate-pulse bg-gray-800 rounded',
  };

  const sizeClasses = {
    sm: variant === 'circular' ? 'w-4 h-4' : 'h-4',
    md: variant === 'circular' ? 'w-8 h-8' : 'h-6',
    lg: variant === 'circular' ? 'w-12 h-12' : 'h-8',
    xl: variant === 'circular' ? 'w-16 h-16' : 'h-10',
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}