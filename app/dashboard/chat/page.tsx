'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { moodEmojis } from '@/app/lib/mood';
import DateDisplay from '@/app/components/DateDisplay';
import MoodStatusDisplay from '@/app/components/MoodStatusDisplay';
import InputBox from '@/app/components/InputBox';
import { DiaryEntry, DayMood } from '@/app/lib/types';
import ChatMessage from '@/app/components/ChatMessage';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      return parseISO(dateParam);
    }
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  });
  
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [dayMood, setDayMood] = useState<DayMood>({ mood: null, moodId: null });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error('用户未登录');
        
        const user = JSON.parse(userStr);
        if (!user.id) throw new Error('用户信息不完整');

        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/mood?date=${dateStr}&userId=${encodeURIComponent(user.id)}`);
        const data = await response.json();
        
        if (data.mood) {
          const moodEntry = Object.values(moodEmojis).find(value => value.id === data.mood);
          if (moodEntry) {
            setDayMood({ mood: moodEntry.emoji, moodId: moodEntry.id });
          } else {
            setDayMood({ mood: null, moodId: null });
          }
        } else {
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
      if (!userStr) throw new Error('用户未登录');
      
      const user = JSON.parse(userStr);
      if (!user.id) throw new Error('用户信息不完整');

      setIsLoading(true);
      setError(null);
      
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
      
      if (isInitial) {
        setDiaryEntries(chatData.chats || []);
      } else {
        setDiaryEntries(prev => [...prev, ...(chatData.chats || [])]);
      }
      setHasMore(chatData.hasMore);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('获取数据失败');
      }
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

  const handleSendMessage = async (content: string) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('用户未登录');
      
      const user = JSON.parse(userStr);
      if (!user.id) throw new Error('用户信息不完整');

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // 1. 获取或创建当天的 day 记录
      const dayResponse = await fetch(`/api/day?date=${dateStr}&userId=${encodeURIComponent(user.id)}`);
      const dayData = await dayResponse.json();
      
      if (!dayResponse.ok || !dayData.day) {
        throw new Error('获取日期记录失败');
      }

      // 2. 发送消息
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          dayId: dayData.day.id
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '发送消息失败');
      }
      
      // 3. 更新消息列表
      setDiaryEntries(prev => [...prev, data]);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  const handleMoodSelect = async (moodKey: keyof typeof moodEmojis) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('用户未登录');
      
      const user = JSON.parse(userStr);
      if (!user.id) throw new Error('用户信息不完整');

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const response = await fetch('/api/mood', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          moodId: moodEmojis[moodKey].id,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新心情失败');
      }

      const data = await response.json();
      setDayMood({
        mood: moodEmojis[moodKey].emoji,
        moodId: moodEmojis[moodKey].id
      });
    } catch (error) {
      console.error('更新心情失败:', error);
    }
  };

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
        <MoodStatusDisplay moodId={dayMood.moodId} />
      </div>

      <div className="flex-1 overflow-y-auto mb-4 bg-gray-100 rounded-lg p-4" ref={chatContainerRef}>
        <div className="space-y-4">
          {diaryEntries.map((entry) => (
            <ChatMessage key={entry.id} message={entry} />
          ))}
          
          {diaryEntries.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-8">
              暂无日记记录
            </div>
          )}
          
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            </div>
          )}
          
          <div ref={observerRef} className="h-4" />
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="mb-4">
        <InputBox
          onSubmit={handleSendMessage}
          placeholder="写下今天的心情..."
          buttonText="发送"
        />
      </div>

      <div className="flex justify-center space-x-4">
        {Object.entries(moodEmojis).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleMoodSelect(key as keyof typeof moodEmojis)}
            className={`text-2xl p-2 rounded-full hover:bg-gray-100 ${
              dayMood.moodId === value.id ? 'bg-blue-100' : ''
            }`}
          >
            {value.emoji}
          </button>
        ))}
      </div>
    </div>
  );
} 