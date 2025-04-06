import { Skeleton } from '../Skeleton';

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