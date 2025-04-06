import { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onRecall: () => void;
}

export default function ContextMenu({ x, y, onClose, onDelete, onRecall }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white shadow-lg rounded-md py-1 z-50"
      style={{ top: y, left: x }}
    >
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
        onClick={onRecall}
      >
        撤回
      </button>
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
        onClick={onDelete}
      >
        删除
      </button>
    </div>
  );
} 