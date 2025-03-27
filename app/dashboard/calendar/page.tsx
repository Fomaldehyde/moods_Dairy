'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRouter, useSearchParams } from 'next/navigation';

// 设置本地化
const locales = {
  'zh-CN': zhCN,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// 定义事件类型
interface DayData {
  date: Date;
  mood?: string;
  todoStatus: 'none' | 'all' | 'some' | 'none-task';
}

// 心情图标映射
const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  excited: "🤩",
  tired: "😴",
  neutral: "😐",
};

// Todo状态颜色映射
const todoStatusColors: Record<string, string> = {
  'none': 'bg-red-500', // 没完成
  'all': 'bg-green-500', // 全部完成
  'some': 'bg-yellow-500', // 部分完成
  'none-task': 'bg-gray-400', // 没有任务
};

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const [daysData, setDaysData] = useState<DayData[]>([]);
  const [currentDate, setCurrentDate] = useState(() => {
    return dateParam ? new Date(dateParam) : new Date();
  });

  useEffect(() => {
    // 模拟获取当月数据
    const fetchCalendarData = async () => {
      try {
        // 实际应用中从API获取数据
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟数据
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        const mockData: DayData[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentYear, currentMonth, day);
          
          // 随机生成心情和待办状态
          const moods = Object.keys(moodEmojis);
          const todoStatuses = ['none', 'all', 'some', 'none-task'] as const;
          
          mockData.push({
            date,
            mood: Math.random() > 0.2 ? moods[Math.floor(Math.random() * moods.length)] : undefined,
            todoStatus: todoStatuses[Math.floor(Math.random() * todoStatuses.length)],
          });
        }
        
        setDaysData(mockData);
      } catch (error) {
        console.error('获取日历数据失败:', error);
      }
    };
    
    fetchCalendarData();
  }, [currentDate]);

  // 当URL中的日期参数变化时更新选中日期
  useEffect(() => {
    if (dateParam) {
      // 处理YYYY-MM-DD格式的日期
      if (dateParam.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateParam.split('-').map(Number);
        setCurrentDate(new Date(year, month - 1, day));
      } else {
        // 兼容旧格式
        setCurrentDate(new Date(dateParam));
      }
    }
  }, [dateParam]);

  // 自定义日期单元格渲染
  const DayCell = ({ date }: { date: Date }) => {
    const dayData = daysData.find(d => 
      d.date.getDate() === date.getDate() && 
      d.date.getMonth() === date.getMonth() && 
      d.date.getFullYear() === date.getFullYear()
    );
    
    if (!dayData) return <div className="h-full"></div>;
    
    // 格式化日期为YYYY-MM-DD格式
    const formatDateForUrl = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const handleMoodClick = () => {
      router.push(`/dashboard/chat?date=${formatDateForUrl(date)}`);
    };
    
    const handleTodoClick = () => {
      router.push(`/dashboard/todo?date=${formatDateForUrl(date)}`);
    };
    
    return (
      <div className="h-full flex flex-col p-1">
        <div className="text-right text-sm">{date.getDate()}</div>
        <div className="flex justify-between mt-1">
          <div 
            className="text-2xl cursor-pointer" 
            onClick={handleMoodClick}
            title="点击记录心情"
          >
            {dayData.mood ? moodEmojis[dayData.mood] : "😶"}
          </div>
          <div 
            className={`w-6 h-6 rounded-full cursor-pointer ${todoStatusColors[dayData.todoStatus]}`}
            onClick={handleTodoClick}
            title="点击查看待办事项"
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">日历视图</h1>
      <div className="flex-1 bg-white rounded-lg shadow p-4">
        <Calendar
          localizer={localizer}
          events={[]}
          startAccessor="start"
          endAccessor="end"
          culture="zh-CN"
          date={currentDate}
          onNavigate={setCurrentDate}
          views={['month']}
          defaultView="month"
          components={{
            dateCellWrapper: ({ value }) => {
              return <DayCell date={value} />;
            },
          }}
          messages={{
            previous: '上个月',
            next: '下个月',
            today: '今天',
            month: '月',
            week: '周',
            day: '日',
          }}
          className="h-full"
        />
      </div>
    </div>
  );
} 