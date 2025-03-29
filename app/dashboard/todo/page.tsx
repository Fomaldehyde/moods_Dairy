'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  dayId: number;
  comments: TodoComment[];
  createdAt: string;
  updatedAt: string;
}

interface TodoComment {
  id: number;
  content: string;
  todoId: number;
  createdAt: string;
  updatedAt: string;
}

// 计算待办事项状态的颜色
const getStatusColor = (todos: Todo[]): string => {
  if (todos.length === 0) {
    return 'bg-green-500'; // 没有待办事项显示绿色
  }
  
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  
  if (completedCount === 0) {
    return 'bg-red-500'; // 有待办事项但一个都没完成显示红色
  } else if (completedCount === totalCount) {
    return 'bg-green-500'; // 全部完成显示绿色
  } else {
    return 'bg-yellow-500'; // 部分完成显示黄色
  }
};

export default function TodoPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      return parseISO(dateParam);
    }
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  });
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [editingTodo, setEditingTodo] = useState<{ id: number; title: string } | null>(null);

  // 当 URL 中的日期参数变化时更新 selectedDate
  useEffect(() => {
    if (dateParam) {
      setSelectedDate(parseISO(dateParam));
    }
  }, [dateParam]);

  // 加载待办事项
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        // 从 localStorage 获取用户信息
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.error('用户未登录');
          return;
        }
        const user = JSON.parse(userStr);

        if (!user.id) {
          console.error('用户信息不完整');
          return;
        }

        // 1. 先获取或创建当天的 day 记录
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        console.log('获取日期记录:', dateStr);
        
        const dayResponse = await fetch(`/api/day?date=${dateStr}&userId=${encodeURIComponent(user.id)}`);
        const dayData = await dayResponse.json();
        
        if (!dayResponse.ok) {
          console.error('获取日期记录失败:', dayData);
          if (dayResponse.status === 404) {
            console.error('用户不存在，请重新登录');
            return;
          }
          throw new Error(dayData.error || '获取日期记录失败');
        }
        
        if (!dayData.day) {
          console.log('没有找到日期记录，显示空列表');
          setTodos([]);
          return;
        }

        // 2. 获取该 day 的待办事项
        const todoResponse = await fetch(`/api/todo?dayId=${dayData.day.id}`);
        const todoData = await todoResponse.json();
        
        if (!todoResponse.ok) {
          console.error('获取待办事项失败:', todoData);
          throw new Error(todoData.error || '获取待办事项失败');
        }
        
        console.log('获取到的待办事项:', todoData.todos);
        setTodos(todoData.todos || []);
      } catch (error) {
        console.error('获取待办事项失败:', error);
        setTodos([]);
      }
    };
    
    fetchTodos();
  }, [selectedDate]);

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    
    try {
      // 从 localStorage 获取用户信息
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('用户未登录');
        return;
      }
      const user = JSON.parse(userStr);

      if (!user.id) {
        console.error('用户信息不完整');
        return;
      }

      // 1. 先获取或创建当天的 day 记录
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayResponse = await fetch(`/api/day?date=${dateStr}&userId=${encodeURIComponent(user.id)}`);
      const dayData = await dayResponse.json();
      
      if (!dayResponse.ok) {
        throw new Error(dayData.error || '获取日期记录失败');
      }
      
      if (!dayData.day) {
        throw new Error('找不到对应的日期记录');
      }

      // 2. 创建新的待办事项
      const response = await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTodo.trim(),
          dayId: dayData.day.id
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '创建待办事项失败');
      }
      
      setTodos([...todos, data.todo]);
      setNewTodo('');
    } catch (error) {
      console.error('创建待办事项失败:', error);
    }
  };

  const handleToggleTodo = async (todoId: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/todo/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '更新待办事项失败');
      }
      
      setTodos(todos.map(todo => 
        todo.id === todoId ? { ...todo, completed } : todo
      ));
    } catch (error) {
      console.error('更新待办事项失败:', error);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      const response = await fetch(`/api/todo/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '删除待办事项失败');
      }
      
      setTodos(todos.filter(todo => todo.id !== todoId));
    } catch (error) {
      console.error('删除待办事项失败:', error);
    }
  };

  const handleAddComment = async (todoId: number) => {
    if (!newComment[todoId]?.trim()) return;
    
    try {
      const response = await fetch('/api/todo/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment[todoId].trim(),
          todoId
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '添加评论失败');
      }
      
      setTodos(todos.map(todo => 
        todo.id === todoId 
          ? { ...todo, comments: [...todo.comments, data.comment] }
          : todo
      ));
      setNewComment({ ...newComment, [todoId]: '' });
    } catch (error) {
      console.error('添加评论失败:', error);
    }
  };

  const handleDeleteComment = async (todoId: number, commentId: number) => {
    try {
      const response = await fetch(`/api/todo/comment/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '删除评论失败');
      }
      
      setTodos(todos.map(todo => 
        todo.id === todoId 
          ? { 
              ...todo, 
              comments: todo.comments.filter(comment => comment.id !== commentId)
            }
          : todo
      ));
    } catch (error) {
      console.error('删除评论失败:', error);
    }
  };

  const handleEditTodo = async (todoId: number, newTitle: string) => {
    try {
      const response = await fetch(`/api/todo/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '更新待办事项失败');
      }
      
      setTodos(todos.map(todo => 
        todo.id === todoId ? { ...todo, title: newTitle } : todo
      ));
      setEditingTodo(null);
    } catch (error) {
      console.error('更新待办事项失败:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}
          </h1>
          <div className={`w-4 h-4 rounded-full ${getStatusColor(todos)}`}></div>
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {todos.length > 0 ? (
            <div className="space-y-4">
              {todos.map((todo) => (
                <div key={todo.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={(e) => handleToggleTodo(todo.id, e.target.checked)}
                        className="w-5 h-5"
                      />
                      {editingTodo?.id === todo.id ? (
                        <input
                          type="text"
                          value={editingTodo.title}
                          onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                          onBlur={() => handleEditTodo(todo.id, editingTodo.title)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditTodo(todo.id, editingTodo.title);
                            }
                          }}
                          className="border rounded px-2 py-1"
                          autoFocus
                        />
                      ) : (
                        <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                          {todo.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingTodo({ id: todo.id, title: todo.title })}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    {todo.comments.map((comment) => (
                      <div key={comment.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                        <span className="text-sm">{comment.content}</span>
                        <button
                          onClick={() => handleDeleteComment(todo.id, comment.id)}
                          className="text-gray-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newComment[todo.id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [todo.id]: e.target.value })}
                        placeholder="添加评论..."
                        className="flex-1 border rounded px-2 py-1 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(todo.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(todo.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              今天还没有待办事项，添加一个吧...
            </div>
          )}
        </div>
        
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="添加新的待办事项..."
              className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTodo();
                }
              }}
            />
            <button
              onClick={handleAddTodo}
              className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
              disabled={!newTodo.trim()}
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 