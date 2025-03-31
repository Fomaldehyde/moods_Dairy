'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { moodEmojis } from '@/app/lib/mood';

interface DiaryEntry {
  id: number;
  content: string;
  dayId: number;
  createdAt: string;
  updatedAt: string;
}

interface DayMood {
  mood: string | null;
  moodId: number | null;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      return parseISO(dateParam);
    }
    const now = new Date();
    // 使用 UTC 时间，避免时区问题
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  });
  
  const [message, setMessage] = useState('');
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [dayMood, setDayMood] = useState<DayMood>({ mood: null, moodId: null });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 当 URL 中的日期参数变化时更新 selectedDate
  useEffect(() => {
    if (dateParam) {
      setSelectedDate(parseISO(dateParam));
    }
  }, [dateParam]);

  // 加载当天的心情
  useEffect(() => {
    const fetchMood = async () => {
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

        // 使用 UTC 日期字符串
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        console.log('当前日期:', dateStr, 'UTC时间:', selectedDate.toISOString());
        const response = await fetch(`/api/mood?date=${dateStr}&userId=${encodeURIComponent(user.id)}`);
        const data = await response.json();
        
        if (data.mood) {
          // 根据 moodId 找到对应的表情
          const moodEntry = Object.values(moodEmojis).find(value => value.id === data.mood);
          if (moodEntry) {
            console.log('找到心情:', moodEntry);
            setDayMood({ mood: moodEntry.emoji, moodId: moodEntry.id });
          } else {
            console.log('未找到对应的心情:', data.mood);
            setDayMood({ mood: null, moodId: null });
          }
        } else {
          console.log('没有心情数据');
          setDayMood({ mood: null, moodId: null });
        }
      } catch (error) {
        console.error('获取心情失败:', error);
        setDayMood({ mood: null, moodId: null });
      }
    };

    fetchMood();
  }, [selectedDate]);

  // 加载聊天记录
  const loadChats = useCallback(async (pageNum: number, isInitial: boolean = false) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      if (!user.id) return;

      setIsLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // 1. 获取或创建当天的 day 记录
      const dayResponse = await fetch(`/api/day?date=${dateStr}&userId=${encodeURIComponent(user.id)}`);
      const dayData = await dayResponse.json();
      
      if (!dayResponse.ok || !dayData.day) {
        setDiaryEntries([]);
        setHasMore(false);
        return;
      }

      // 2. 获取聊天记录
      const chatResponse = await fetch(`/api/chat?dayId=${dayData.day.id}&page=${pageNum}&limit=20`);
      const chatData = await chatResponse.json();
      
      if (!chatResponse.ok) {
        throw new Error(chatData.error || '获取聊天记录失败');
      }
      
      setDiaryEntries(prev => 
        isInitial ? chatData.chats : [...prev, ...chatData.chats]
      );
      setHasMore(chatData.hasMore);
    } catch (error) {
      console.error('获取聊天记录失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // 初始加载
  useEffect(() => {
    setPage(1);
    loadChats(1, true);
  }, [selectedDate, loadChats]);

  // 设置无限滚动观察器
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [hasMore, isLoading]);

  // 加载更多数据
  useEffect(() => {
    if (page > 1) {
      loadChats(page, false);
    }
  }, [page, loadChats]);

  // 发送新消息时滚动到底部
  useEffect(() => {
    if (messagesEndRef.current && page === 1) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [diaryEntries, page]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
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
      console.log('发送消息，获取日期记录:', dateStr);
      
      const dayResponse = await fetch(`/api/day?date=${dateStr}&userId=${encodeURIComponent(user.id)}`);
      const dayData = await dayResponse.json();
      
      if (!dayResponse.ok) {
        console.error('获取日期记录失败:', dayData);
        if (dayResponse.status === 404) {
          console.error('用户不存在，请重新登录');
          // 这里可以添加重定向到登录页面的逻辑
          return;
        }
        throw new Error(dayData.error || '获取日期记录失败');
      }
      
      console.log('获取到的日期记录:', dayData);
      
      if (!dayData.day) {
        throw new Error('找不到对应的日期记录');
      }

      // 2. 发送聊天记录
      console.log('发送聊天记录，dayId:', dayData.day.id);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message.trim(),
          dayId: dayData.day.id
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('保存聊天记录失败:', responseData);
        throw new Error(responseData.error || '保存聊天记录失败');
      }
      
      console.log('新发送的消息:', responseData);
      setDiaryEntries([...diaryEntries, responseData]);
      setMessage('');
    } catch (error) {
      console.error('保存日记失败:', error);
    }
  };

  const handleMoodSelect = async (moodKey: keyof typeof moodEmojis) => {
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

      const selectedMood = moodEmojis[moodKey];
      console.log('选择的心情:', selectedMood);

      const response = await fetch('/api/mood', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: format(selectedDate, 'yyyy-MM-dd'),
          moodId: selectedMood.id,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('更新心情失败');
      }

      const data = await response.json();
      console.log('心情更新成功:', data);
      setDayMood({ mood: selectedMood.emoji, moodId: selectedMood.id });
      setShowMoodSelector(false);
    } catch (error) {
      console.error('更新心情失败:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}
          </h1>
          <div className="relative">
            <button
              onClick={() => setShowMoodSelector(!showMoodSelector)}
              className="p-2 rounded-full hover:bg-gray-100"
              title="选择心情"
            >
              <span className="text-3xl">{dayMood.mood || "🍃"}</span>
            </button>
            {showMoodSelector && (
              <div className="absolute right-0 mt-2 flex flex-wrap gap-2 bg-white p-2 rounded-lg shadow-lg z-10">
                {Object.entries(moodEmojis).map(([mood, { emoji, label }]) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodSelect(mood as keyof typeof moodEmojis)}
                    className={`flex flex-col items-center p-2 rounded-lg ${
                      dayMood.mood === emoji ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs mt-1">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto" ref={chatContainerRef}>
          {diaryEntries.length > 0 ? (
            <div className="space-y-4">
              {/* 加载更多指示器 */}
              {isLoading && page > 1 && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              )}
              
              {/* 无限滚动观察点 */}
              <div ref={observerRef} className="h-4" />
              
              {/* 聊天记录 */}
              {diaryEntries.map((entry) => (
                <div key={entry.id} className="flex flex-col max-w-[80%] ml-auto bg-blue-100 rounded-lg p-3">
                  <div className="flex items-center justify-end mb-1">
                    <div className="text-xs text-gray-500">
                      {format(new Date(entry.createdAt), 'HH:mm')}
                    </div>
                  </div>
                  <p>{entry.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              今天还没有记录，写点什么吧...
            </div>
          )}
        </div>
        
        <div className="border-t p-4">
          <div className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="记录你的想法..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
              disabled={!message.trim()}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 