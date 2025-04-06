import { Skeleton } from '../Skeleton';

export function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 42 }).map((_, index) => (
        <Skeleton key={index} className="h-24" />
      ))}
    </div>
  );
} 