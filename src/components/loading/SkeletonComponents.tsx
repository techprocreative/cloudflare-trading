import React from 'react';
import { Skeleton } from './Skeleton';

interface SkeletonCardProps {
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showButton?: boolean;
  lines?: number;
  className?: string;
}

export function SkeletonCard({ 
  showImage = true, 
  showTitle = true, 
  showDescription = true,
  showButton = false,
  lines = 2,
  className = ""
}: SkeletonCardProps) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3 ${className}`}>
      {showImage && (
        <Skeleton variant="rectangular" size="lg" className="w-full h-48 rounded-md" />
      )}
      
      {showTitle && (
        <Skeleton variant="text" size="lg" className="w-3/4 h-6" />
      )}
      
      {showDescription && (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i} 
              variant="text" 
              size="md" 
              className={`w-full h-4 ${i === lines - 1 ? 'w-2/3' : ''}`} 
            />
          ))}
        </div>
      )}
      
      {showButton && (
        <Skeleton variant="rectangular" size="md" className="w-24 h-8 mt-4" />
      )}
    </div>
  );
}

interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showAction?: boolean;
  className?: string;
}

export function SkeletonList({ 
  items = 5, 
  showAvatar = true, 
  showTitle = true, 
  showDescription = true,
  showAction = false,
  className = ""
}: SkeletonListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
          {showAvatar && (
            <Skeleton variant="circular" size="md" />
          )}
          
          <div className="flex-1 space-y-2">
            {showTitle && (
              <Skeleton variant="text" size="md" className="w-1/3 h-5" />
            )}
            {showDescription && (
              <Skeleton variant="text" size="sm" className="w-2/3 h-4" />
            )}
          </div>
          
          {showAction && (
            <Skeleton variant="rectangular" size="sm" className="w-16 h-8" />
          )}
        </div>
      ))}
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  className = ""
}: SkeletonTableProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {showHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" size="md" className="h-6 w-full" />
          ))}
        </div>
      )}
      
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                variant="text" 
                size="md" 
                className={`h-4 w-full ${colIndex === 0 ? 'w-1/2' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SkeletonChartProps {
  height?: number;
  showLegend?: boolean;
  showYAxis?: boolean;
  showXAxis?: boolean;
  className?: string;
}

export function SkeletonChart({ 
  height = 200, 
  showLegend = true,
  showYAxis = true,
  showXAxis = true,
  className = ""
}: SkeletonChartProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Chart area */}
      <div className="relative bg-gray-800 rounded-lg border border-gray-700 p-4">
        <Skeleton variant="rectangular" className="w-full" style={{ height }} />
        
        {/* Chart bars/lines simulation */}
        <div className="absolute inset-0 flex items-end justify-around p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton 
              key={i} 
              variant="rectangular" 
              className="w-8 bg-gray-600 rounded-t"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center space-x-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton variant="circular" size="sm" />
              <Skeleton variant="text" size="sm" className="w-16 h-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SkeletonDashboardProps {
  className?: string;
}

export function SkeletonDashboard({ className = "" }: SkeletonDashboardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" size="xl" className="w-48 h-8" />
        <Skeleton variant="rectangular" size="md" className="w-24 h-8" />
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
            <Skeleton variant="text" size="sm" className="w-20 h-4" />
            <Skeleton variant="text" size="xl" className="w-16 h-8" />
            <Skeleton variant="text" size="sm" className="w-24 h-4" />
          </div>
        ))}
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <SkeletonChart height={300} />
        </div>
        
        {/* Recent activity */}
        <div className="space-y-4">
          <Skeleton variant="text" size="lg" className="w-32 h-6" />
          <SkeletonList items={4} showAvatar={true} showTitle={true} showDescription={true} />
        </div>
      </div>
      
      {/* Recent signals */}
      <div className="space-y-4">
        <Skeleton variant="text" size="lg" className="w-32 h-6" />
        <SkeletonTable rows={5} columns={5} />
      </div>
    </div>
  );
}

interface SkeletonProfileProps {
  className?: string;
}

export function SkeletonProfile({ className = "" }: SkeletonProfileProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-6">
          <Skeleton variant="circular" size="xl" />
          <div className="flex-1 space-y-3">
            <Skeleton variant="text" size="xl" className="w-48 h-8" />
            <Skeleton variant="text" size="md" className="w-32 h-5" />
            <Skeleton variant="text" size="md" className="w-24 h-4" />
          </div>
          <Skeleton variant="rectangular" size="md" className="w-24 h-8" />
        </div>
      </div>
      
      {/* Profile content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton variant="text" size="lg" className="w-32 h-6" />
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton variant="text" size="sm" className="w-20 h-4" />
                <Skeleton variant="text" size="md" className="w-full h-5" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton variant="text" size="lg" className="w-32 h-6" />
          <SkeletonList items={3} showAvatar={true} showTitle={true} showDescription={false} />
        </div>
      </div>
    </div>
  );
}