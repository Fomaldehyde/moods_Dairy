'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Todo } from '@/app/lib/types';
import DateDisplay from '@/app/components/DateDisplay';
import MoodStatusDisplay from '@/app/components/MoodStatusDisplay';
import InputBox from '@/app/components/InputBox';
import TodoItem from '@/app/components/TodoItem';
import { TodoSkeleton } from '@/app/components/Skeletons/TodoSkeleton';

// 计算待办事项状态的颜色
const getStatusColor = (todos: Todo[]): 'green' | 'yellow' | 'red' => {
  if (todos.length === 0) return 'green';
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  
  if (completedCount === 0) return 'red';
  if (completedCount === totalCount) return 'green';
  return 'yellow';
};

// 将待办事项列表抽取为单独的组件
function TodoList({ 
  todos, 
  onToggle, 
  onDelete, 
  onEdit, 
  onAddComment, 
  onDeleteComment 
}: { 
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number, newTitle: string) => Promise<void>;
  onAddComment: (todoId: number, content: string) => Promise<void>;
  onDeleteComment: (todoId: number, commentId: number) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          id={todo.id}
          title={todo.title}
          completed={todo.completed}
          comments={todo.comments}
          createdAt={todo.createdAt}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  );
}

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
  const [dayId, setDayId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 当 URL 中的日期参数变化时更新 selectedDate
  useEffect(() => {
    if (dateParam) {
      setSelectedDate(parseISO(dateParam));
    }
  }, [dateParam]);

  // 加载待办事项
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error('用户未登录');
        
        const user = JSON.parse(userStr);
        if (!user.id) throw new Error('用户信息不完整');

        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        
        // 1. 获取或创建当天的 day 记录
        const dayResponse = await fetch(`/api/day?date=${dateStr}&userId=${encodeURIComponent(user.id)}`);
        const dayData = await dayResponse.json();
        
        if (!dayResponse.ok) {
          throw new Error(dayData.error || '获取日期记录失败');
        }
        
        if (!dayData.day) {
          setTodos([]);
          setDayId(null);
          return;
        }

        setDayId(dayData.day.id);

        // 2. 获取该 day 的待办事项
        const todoResponse = await fetch(`/api/todo?dayId=${dayData.day.id}`);
        const todoData = await todoResponse.json();
        
        if (!todoResponse.ok) {
          throw new Error(todoData.error || '获取待办事项失败');
        }
        
        setTodos(todoData.todos || []);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('获取数据失败');
        }
        console.error('获取待办事项失败:', error);
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTodos();
  }, [selectedDate]);

  const handleAddTodo = async (title: string) => {
    if (!dayId) return;
    
    try {
      const response = await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          dayId
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '创建待办事项失败');
      }
      
      setTodos([...todos, data.todo]);
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
    } catch (error) {
      console.error('更新待办事项失败:', error);
    }
  };

  const handleAddComment = async (todoId: number, content: string) => {
    try {
      const response = await fetch('/api/todo/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, todoId }),
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
          ? { ...todo, comments: todo.comments.filter(c => c.id !== commentId) }
          : todo
      ));
    } catch (error) {
      console.error('删除评论失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">加载失败！</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <DateDisplay date={selectedDate} />
        <MoodStatusDisplay moodId={null} status={getStatusColor(todos)} />
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        <Suspense fallback={<TodoSkeleton />}>
          <TodoList
            todos={todos}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
            onEdit={handleEditTodo}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        </Suspense>
        
        {todos.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            暂无待办事项
          </div>
        )}
        
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <InputBox
          onSubmit={handleAddTodo}
          placeholder="添加新的待办事项..."
          buttonText="添加"
        />
      </div>
    </div>
  );
} 