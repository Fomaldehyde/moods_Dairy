'use client';

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter } from 'next/navigation';
import { getDayData, DayData } from '@/app/lib/data';

export default function Page() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayDataMap, setDayDataMap] = useState<{ [date: string]: DayData }>({});
  const router = useRouter();

  // 获取某一天的数据
  const fetchDayData = async (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    if (!dayDataMap[dateString]) {
      const data = await getDayData(dateString);
      if (data) {
        setDayDataMap((prev) => ({ ...prev, [dateString]: data }));
      }
    }
  };

  // 计算待办事项状态颜色
  const getTodoStatusColor = (status: DayData['todoStatus']) => {
    switch (status) {
      case 'allCompleted':
        return 'bg-green-400'; // 全部完成
      case 'noneCompleted':
        return 'bg-red-400'; // 全部未完成
      case 'partiallyCompleted':
        return 'bg-yellow-400'; // 部分完成
      default:
        return 'bg-gray-400'; // 无任务
    }
  };

  // 渲染日历单元格内容
  const tileContent = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split('T')[0];
    const day = dayDataMap[dateString];

    if (!day) return null;

    return (
      <div className="flex flex-col items-center">
        {/* 心情图标 */}
        <div
          className="text-2xl cursor-pointer"
          onClick={() => router.push(`/dashboard/chat?date=${dateString}`)}
        >
          {day.mood}
        </div>
        {/* 待办事项状态 */}
        <div
          className={`w-3 h-3 rounded-full mt-1 ${getTodoStatusColor(day.todoStatus)}`}
          onClick={() => router.push(`/dashboard/todo?date=${dateString}`)}
        ></div>
      </div>
    );
  };

  // 当选中日期变化时，加载对应的数据
  useEffect(() => {
    if (selectedDate) {
      fetchDayData(selectedDate);
    }
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Calendar
          onChange={(value) => setSelectedDate(value instanceof Date ? value : null)}
          value={selectedDate}
          tileContent={tileContent}
        />
      </div>
    </div>
  );
}