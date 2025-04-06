import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DiaryEntry } from '@/app/lib/types';
import { useState } from 'react';
import ContextMenu from './ContextMenu';

interface ChatMessageProps {
  message: DiaryEntry;
  className?: string;
  onDelete?: (message: DiaryEntry) => void;
  onRecall?: (message: DiaryEntry) => void;
}

export default function ChatMessage({ message, className = '', onDelete, onRecall }: ChatMessageProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    onDelete?.(message);
    setContextMenu(null);
  };

  const handleRecall = () => {
    onRecall?.(message);
    setContextMenu(null);
  };

  return (
    <>
      <div 
        className={`flex justify-end ${className}`}
        onContextMenu={handleContextMenu}
      >
        <div className="max-w-[80%]">
          <div className="bg-white-500 text-black rounded-lg shadow-sm p-3">
            <p>{message.content}</p>
          </div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            {format(new Date(message.createdAt), 'HH:mm', { locale: zhCN })}
          </div>
        </div>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={handleDelete}
          onRecall={handleRecall}
        />
      )}
    </>
  );
} 