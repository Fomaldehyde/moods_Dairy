'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Todo, TodoComment } from '@/app/lib/types';

interface TodoItemProps {
  id: number;
  title: string;
  completed: boolean;
  comments: TodoComment[];
  createdAt: string;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number, newTitle: string) => Promise<void>;
  onAddComment: (todoId: number, content: string) => Promise<void>;
  onDeleteComment: (todoId: number, commentId: number) => Promise<void>;
}

export default function TodoItem({
  id,
  title,
  completed,
  comments,
  createdAt,
  onToggle,
  onDelete,
  onEdit,
  onAddComment,
  onDeleteComment
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async () => {
    if (editTitle.trim() === title) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onEdit(id, editTitle.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('编辑失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(id, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('添加评论失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => onToggle(id, e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <span className={`flex-1 ${completed ? 'line-through text-gray-500' : ''}`}>
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-blue-500"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-gray-500 hover:text-red-500"
          >
            删除
          </button>
        </div>
      </div>

      {/* 评论列表 */}
      {comments.length > 0 && (
        <div className="mt-4 space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-2 text-sm">
              <div className="flex-1 bg-gray-50 p-2 rounded">
                <div className="text-gray-600">{comment.content}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {format(new Date(comment.createdAt), 'MM-dd HH:mm', { locale: zhCN })}
                </div>
              </div>
              <button
                onClick={() => onDeleteComment(id, comment.id)}
                className="text-gray-400 hover:text-red-500"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 添加评论 */}
      <form onSubmit={handleAddComment} className="mt-4 flex space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="添加评论..."
          className="flex-1 px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          添加
        </button>
      </form>
    </div>
  );
} 