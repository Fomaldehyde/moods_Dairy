interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex justify-end">
          <div className="max-w-[80%]">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-16 mt-1 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TodoSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2 p-4 bg-white rounded-lg shadow">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 flex-1" />
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 42 }).map((_, index) => (
        <Skeleton key={index} className="h-24" />
      ))}
    </div>
  );
} 