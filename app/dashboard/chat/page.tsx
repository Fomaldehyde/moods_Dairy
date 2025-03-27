'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 心情图标映射
const moodEmojis: Record<string, { emoji: string, label: string }> = {
  happy: { emoji: "😊", label: "开心" },
  sad: { emoji: "😢", label: "难过" },
  angry: { emoji: "😠", label: "生气" },
  excited: { emoji: "🤩", label: "兴奋" },
  tired: { emoji: "😴", label: "疲惫" },
  neutral: { emoji: "😐", label: "平静" },
};

interface DiaryEntry {
  id: string;
  content: string;
  mood: string;
  timestamp: Date;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState(() => {
    return dateParam ? new Date(dateParam) : new Date();
  });
  
  const [message, setMessage] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
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

  // 加载日记条目
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        // 实际应用中从API获取数据
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 获取选中日期的年月日部分（避免小时分钟影响）
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();
        const dateOnly = new Date(year, month, day);
        
        // 模拟数据
        const mockEntries: DiaryEntry[] = [
          {
            id: '1',
            content: '今天天气很好，心情愉快！',
            mood: 'happy',
            timestamp: new Date(dateOnly.getTime() + 9 * 60 * 60 * 1000 + 30 * 60 * 1000),
          },
          {
            id: '2',
            content: '下午开会很累，但是进展顺利。',
            mood: 'tired',
            timestamp: new Date(dateOnly.getTime() + 15 * 60 * 60 * 1000 + 45 * 60 * 1000),
          },
          {
            id: '3',
            content: '晚上和朋友聚餐，聊得很开心！',
            mood: 'excited',
            timestamp: new Date(dateOnly.getTime() + 20 * 60 * 60 * 1000 + 15 * 60 * 1000),
          },
        ];
        
        setDiaryEntries(mockEntries);
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
    if (!message.trim() && !selectedMood) return;
    
    // 创建新条目
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      content: message.trim(),
      mood: selectedMood || 'neutral',
      timestamp: new Date(),
    };
    
    // 添加到列表
    setDiaryEntries([...diaryEntries, newEntry]);
    
    // 重置输入
    setMessage('');
    setSelectedMood('');
    setShowMoodSelector(false);
    
    // 实际应用中会发送到API
    try {
      // await fetch('/api/diary', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...newEntry,
      //     date: selectedDate.toISOString() // 确保使用所选日期
      //   }),
      // });
      console.log('日记已保存', { ...newEntry, date: selectedDate });
    } catch (error) {
      console.error('保存日记失败:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <h1 className="text-2xl font-bold">
          {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })} 的日记
        </h1>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {diaryEntries.length > 0 ? (
            <div className="space-y-4">
              {diaryEntries.map((entry) => (
                <div key={entry.id} className="flex flex-col max-w-[80%] ml-auto bg-blue-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{moodEmojis[entry.mood].emoji}</span>
                    <span className="text-xs text-gray-500">
                      {format(entry.timestamp, 'HH:mm')}
                    </span>
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
            <button
              onClick={() => setShowMoodSelector(!showMoodSelector)}
              className="p-2 rounded-full hover:bg-gray-100 mr-2"
              title="选择心情"
            >
              {selectedMood ? moodEmojis[selectedMood].emoji : "😀"}
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="记录你的想法..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
              disabled={!message.trim() && !selectedMood}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {showMoodSelector && (
            <div className="mt-2 flex flex-wrap gap-2 bg-white p-2 rounded-lg shadow-lg">
              {Object.entries(moodEmojis).map(([mood, { emoji, label }]) => (
                <button
                  key={mood}
                  onClick={() => {
                    setSelectedMood(mood);
                    setShowMoodSelector(false);
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg ${
                    selectedMood === mood ? 'bg-blue-100' : 'hover:bg-gray-100'
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
  );
} 