'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 心情图标映射
const moodEmojis: Record<string, { emoji: string, label: string, id: number }> = {
  HAPPY: { emoji: "😊", label: "开心", id: 1 },
  SAD: { emoji: "😢", label: "难过", id: 2 },
  ANGRY: { emoji: "😡", label: "生气", id: 3 },
  NEUTRAL: { emoji: "😐", label: "平静", id: 4 },
  EXCITED: { emoji: "🤩", label: "兴奋", id: 5 },
  TIRED: { emoji: "😫", label: "疲惫", id: 6 },
  PEACEFUL: { emoji: "😌", label: "平和", id: 7 },
  ANXIOUS: { emoji: "😰", label: "焦虑", id: 8 },
};

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
  const dateParam = searchParams.get('dayId');
  const [selectedDate, setSelectedDate] = useState(() => {
    return dateParam ? new Date(dateParam) : new Date();
  });
  
  const [message, setMessage] = useState('');
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [dayMood, setDayMood] = useState<DayMood>({ mood: null, moodId: null });
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // 加载当天的心情
  useEffect(() => {
    const fetchMood = async () => {
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/mood?date=${dateStr}`);
        const data = await response.json();
        setDayMood(data);
      } catch (error) {
        console.error('获取心情失败:', error);
      }
    };

    fetchMood();
  }, [selectedDate]);

  // 加载日记条目
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        // 直接使用 dayId=1 获取聊天记录
        const response = await fetch('/api/chat?dayId=1');
        if (!response.ok) throw new Error('获取聊天记录失败');
        const data = await response.json();
        console.log('获取到的聊天记录:', data.chats);
        setDiaryEntries(data.chats);
      } catch (error) {
        console.error('获取日记失败:', error);
      }
    };
    
    fetchEntries();
  }, [selectedDate]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [diaryEntries]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      // 直接发送到 dayId=1
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message.trim(),
          dayId: 1
        }),
      });

      if (!response.ok) throw new Error('保存聊天记录失败');
      const newEntry = await response.json();
      console.log('新发送的消息:', newEntry);
      
      setDiaryEntries([...diaryEntries, newEntry]);
      setMessage('');
    } catch (error) {
      console.error('保存日记失败:', error);
    }
  };

  const handleMoodSelect = async (moodKey: string) => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/mood?date=${dateStr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodId: moodEmojis[moodKey].id }),
      });
      const data = await response.json();
      setDayMood(data);
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
            {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })} 的日记
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
                    onClick={() => handleMoodSelect(mood)}
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
        <div className="flex-1 p-4 overflow-y-auto">
          {diaryEntries.length > 0 ? (
            <div className="space-y-4">
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