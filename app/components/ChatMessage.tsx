import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DiaryEntry } from '@/app/lib/types';

interface ChatMessageProps {
  message: DiaryEntry;
  className?: string;
}

export default function ChatMessage({ message, className = '' }: ChatMessageProps) {
  return (
    <div className={`flex justify-end ${className}`}>
      <div className="max-w-[80%]">
        <div className="bg-white-500 text-black rounded-lg shadow-sm p-3">
          <p>{message.content}</p>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">
          {format(new Date(message.createdAt), 'HH:mm', { locale: zhCN })}
        </div>
      </div>
    </div>
  );
} 