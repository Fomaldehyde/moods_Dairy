'use client';

import { moodEmojis } from '@/app/lib/mood';

interface MoodStatusDisplayProps {
  moodId: number | null;
  status?: 'green' | 'yellow' | 'red' | null;
  className?: string;
}

export default function MoodStatusDisplay({ moodId, status, className = '' }: MoodStatusDisplayProps) {
  const getMoodEmoji = (id: number) => {
    const mood = Object.values(moodEmojis).find(m => m.id === id);
    return mood ? mood.emoji : '🍃';
  };

  const getMoodLabel = (id: number) => {
    const mood = Object.values(moodEmojis).find(m => m.id === id);
    return mood ? mood.label : '未知';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {moodId ? (
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getMoodEmoji(moodId)}</span>
          <span className="text-sm text-gray-600">{getMoodLabel(moodId)}</span>
        </div>
      ) : status ? (
        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
      ) : null}
    </div>
  );
} 