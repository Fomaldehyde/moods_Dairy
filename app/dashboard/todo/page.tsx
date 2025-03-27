'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  comment?: string;
  date: Date;
}

export default function TodoPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState(() => {
    return dateParam ? new Date(dateParam) : new Date();
  });
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string>('');

  // 当URL中的日期参数变化时更新selectedDate
  useEffect(() => {
    if (dateParam) {
      // 处理YYYY-MM-DD格式的日期
      if (dateParam.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateParam.split('-').map(Number);
        setSelectedDate(new Date(year, month - 1, day));
      } else {
        // 兼容旧格式
        setSelectedDate(new Date(dateParam));
      }
    }
  }, [dateParam]);

  // 加载待办事项
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        // 实际应用中从API获取数据
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟数据
        const mockTodos: Todo[] = [
          {
            id: '1',
            title: '完成项目报告',
            completed: false,
            date: selectedDate,
            comment: '这个报告很重要，需要认真对待'
          },
          {
            id: '2',
            title: '健身30分钟',
            completed: true,
            date: selectedDate,
          },
          {
            id: '3',
            title: '准备明天的会议',
            completed: false,
            date: selectedDate,
            comment: '需要准备演示文稿和讲稿'
          },
        ];
        
        setTodos(mockTodos);
      } catch (error) {
        console.error('获取待办事项失败:', error);
      }
    };
    
    fetchTodos();
  }, [selectedDate]);

  // 添加新待办
  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: newTodoTitle.trim(),
      completed: false,
      date: selectedDate,
    };
    
    // 添加到列表
    setTodos([...todos, newTodo]);
    setNewTodoTitle('');
    
    // 实际应用中会发送到API
    try {
      // await fetch('/api/todos', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTodo),
      // });
      console.log('待办事项已添加', newTodo);
    } catch (error) {
      console.error('添加待办事项失败:', error);
    }
  };

  // 切换待办完成状态
  const toggleTodoStatus = async (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    setTodos(updatedTodos);
    
    // 实际应用中会发送到API
    try {
      // const todoToUpdate = updatedTodos.find(todo => todo.id === id);
      // await fetch(`/api/todos/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     completed: todoToUpdate.completed,
      //     date: selectedDate.toISOString() 
      //   }),
      // });
      console.log('待办事项状态已更新', id);
    } catch (error) {
      console.error('更新待办事项失败:', error);
    }
  };

  // 删除待办
  const handleDeleteTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    
    // 实际应用中会发送到API
    try {
      // await fetch(`/api/todos/${id}?date=${selectedDate.toISOString()}`, {
      //   method: 'DELETE',
      // });
      console.log('待办事项已删除', id);
    } catch (error) {
      console.error('删除待办事项失败:', error);
    }
  };

  // 切换评论编辑状态
  const toggleCommentEdit = (id: string, comment?: string) => {
    if (editingTodoId === id) {
      setEditingTodoId(null);
      setEditingComment('');
    } else {
      setEditingTodoId(id);
      setEditingComment(comment || '');
    }
  };

  // 保存评论
  const saveComment = async (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, comment: editingComment.trim() } : todo
    );
    
    setTodos(updatedTodos);
    setEditingTodoId(null);
    setEditingComment('');
    
    // 实际应用中会发送到API
    try {
      // const todoToUpdate = updatedTodos.find(todo => todo.id === id);
      // await fetch(`/api/todos/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     comment: todoToUpdate.comment,
      //     date: selectedDate.toISOString()
      //   }),
      // });
      console.log('待办事项评论已更新', id);
    } catch (error) {
      console.error('更新待办事项评论失败:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <h1 className="text-2xl font-bold">
          {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })} 的待办事项
        </h1>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <div className="flex">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="添加新待办事项..."
              className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTodo();
                }
              }}
            />
            <button
              onClick={handleAddTodo}
              className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600 flex items-center"
              disabled={!newTodoTitle.trim()}
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              添加
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {todos.length > 0 ? (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li key={todo.id} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center p-3">
                    <button
                      onClick={() => toggleTodoStatus(todo.id)}
                      className={`w-6 h-6 rounded-full mr-3 flex-shrink-0 flex items-center justify-center border ${
                        todo.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                      }`}
                    >
                      {todo.completed && <CheckIcon className="w-4 h-4" />}
                    </button>
                    <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                      {todo.title}
                    </span>
                    <button
                      onClick={() => toggleCommentEdit(todo.id, todo.comment)}
                      className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100 mr-1"
                      title={todo.comment ? "编辑评价" : "添加评价"}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                      title="删除"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {editingTodoId === todo.id ? (
                    <div className="p-3 bg-gray-50 border-t">
                      <div className="flex">
                        <textarea
                          value={editingComment}
                          onChange={(e) => setEditingComment(e.target.value)}
                          placeholder="添加对任务的评价..."
                          className="flex-1 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={() => toggleCommentEdit(todo.id)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 rounded hover:bg-gray-200 flex items-center"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          取消
                        </button>
                        <button
                          onClick={() => saveComment(todo.id)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                        >
                          <CheckIcon className="w-4 h-4 mr-1" />
                          保存
                        </button>
                      </div>
                    </div>
                  ) : todo.comment ? (
                    <div 
                      className="p-3 text-sm text-gray-600 bg-gray-50 border-t"
                      onClick={() => toggleCommentEdit(todo.id, todo.comment)}
                    >
                      <p>{todo.comment}</p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              今天还没有待办事项，添加一些吧！
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 