'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  animated = true,
}: SkeletonProps) {
  const baseClasses = `bg-gray-200 dark:bg-gray-700 ${
    animated ? 'animate-shimmer' : ''
  }`;

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    rounded: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${
              i === lines - 1 ? 'w-3/4' : 'w-full'
            } mb-2`}
            style={i === lines - 1 ? { width: '75%' } : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common patterns
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700 ${className}`}>
      <Skeleton variant="text" width="60%" height={24} className="mb-4" />
      <Skeleton variant="text" lines={3} className="mb-4" />
      <Skeleton variant="rectangular" width="40%" height={32} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Skeleton variant="text" width="30%" height={20} />
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton
                  key={j}
                  variant="text"
                  width={j === 0 ? '30%' : '20%'}
                  height={16}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1">
              <Skeleton variant="text" width="40%" height={20} className="mb-2" />
              <Skeleton variant="text" width="60%" height={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="200px" height={32} />
        <Skeleton variant="rectangular" width="120px" height={40} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
