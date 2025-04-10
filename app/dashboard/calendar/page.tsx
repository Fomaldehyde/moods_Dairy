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

interface CalendarEvent {
  start: Date;
  end: Date;
  mood: string | null;
  status: 'green' | 'yellow' | 'red' | null;
}

interface CalendarData {
  date: string;
  mood: string | null;
  status: 'green' | 'yellow' | 'red' | null;
}

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date'); // 从 URL 中获取日期参数
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    return dateParam ? new Date(dateParam) : new Date(); // 初始化为 URL 中的日期或当前日期
  });

  useEffect(() => {
    // 当 URL 中的日期参数变化时更新 selectedDate
    if (dateParam) {
      setSelectedDate(new Date(dateParam));
    }
  }, [dateParam]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const response = await fetch('/api/calendar');
        const data = await response.json() as CalendarData[];
        
        // 转换数据为事件格式
        const calendarEvents = data.map((item: CalendarData) => ({
          start: new Date(item.date),
          end: new Date(item.date),
          mood: item.mood,
          status: item.status,
        }));

        setEvents(calendarEvents);
      } catch (error) {
        console.error('获取日历数据失败:', error);
      }
    };

    fetchCalendarData();
  }, []);

  const handleSelectEvent = (event: CalendarEvent) => {
    const date = format(event.start, 'yyyy-MM-dd');
    router.push(`/dashboard/chat?date=${date}`);
  };

  const eventStyleGetter = () => {
    const style: React.CSSProperties = {
      backgroundColor: 'transparent',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'auto',
      padding: '1px',
    };

    return {
      style,
    };
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    return (
      <div className="flex items-center justify-center gap-1">
        <div className="flex items-center gap-1">
          {event.mood && (
            <div className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xs">{event.mood}</span>
            </div>
          )}
          {event.status && (
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: event.status === 'green' ? '#4CAF50' : 
                               event.status === 'yellow' ? '#FFC107' : '#F44336'
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4">

      {/* 日历视图 */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={selectedDate} // 根据选中的日期切换视图
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        components={{
          event: EventComponent,
        }}
        eventPropGetter={eventStyleGetter}
        views={['month']}
        toolbar={false}
        className="text-sm [&_.rbc-date-cell]:text-2xl [&_.rbc-date-cell]:font-medium [&_.rbc-date-cell]:flex [&_.rbc-date-cell]:items-center [&_.rbc-date-cell]:justify-center [&_.rbc-off-range]:text-gray-300 [&_.rbc-off-range-bg]:bg-gray-50 [&_.rbc-today]:bg-blue-50 [&_.rbc-month-view]:h-full [&_.rbc-row]:flex-1 [&_.rbc-row-content]:flex-1 [&_.rbc-row-content]:flex-col [&_.rbc-row-content]:justify-between [&_.rbc-date-cell]:h-full [&_.rbc-date-cell]:flex-col [&_.rbc-date-cell]:justify-between [&_.rbc-date-cell]:gap-1 [&_.rbc-event]:mt-auto [&_.rbc-event]:mb-1"
      />
    </div>
  );
}