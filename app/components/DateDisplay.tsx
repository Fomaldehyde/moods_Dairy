'use client';

import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface DateDisplayProps {
  date: Date;
  className?: string;
}

export default function DateDisplay({ date, className = '' }: DateDisplayProps) {
  return (
    <div className={`text-2xl font-bold mb-4 ${className}`}>
      {format(date, 'yyyy年MM月dd日', { locale: zhCN })}
    </div>
  );
} 