'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { moodEmojis } from '@/app/lib/mood';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MoodStats {
  moodStats: { [key: number]: number };
  totalDays: number;
  mostFrequentMood: number | null;
  daysWithMood: number;
}

interface TodoStats {
  score: number;
  completedDays: number;
  partialCompletedDays: number;
  totalDays: number;
}

// 饼图颜色配置
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface HomePageProps {
  selectedDate?: Date;
}

export default function HomePage({ selectedDate }: HomePageProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [todoStats, setTodoStats] = useState<TodoStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 当选择的日期改变时更新 currentDate
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        if (!user.id) return;

        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        // 获取心情统计
        const moodResponse = await fetch(`/api/mood/stats?userId=${encodeURIComponent(user.id)}&date=${dateStr}`);
        const moodData = await moodResponse.json();
        
        // 获取任务统计
        const todoResponse = await fetch(`/api/todo/stats?userId=${encodeURIComponent(user.id)}&date=${dateStr}`);
        const todoData = await todoResponse.json();
        
        if (moodResponse.ok) {
          setMoodStats(moodData);
        }
        if (todoResponse.ok) {
          setTodoStats(todoData);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentDate]);

  const getMoodEmoji = (moodId: number) => {
    const mood = Object.values(moodEmojis).find(m => m.id === moodId);
    return mood ? mood.emoji : '🍃';
  };

  const getMoodLabel = (moodId: number) => {
    const mood = Object.values(moodEmojis).find(m => m.id === moodId);
    return mood ? mood.label : '未知';
  };

  // 准备饼图数据
  const pieData = moodStats ? Object.entries(moodStats.moodStats).map(([moodId, count]) => ({
    name: `${getMoodEmoji(parseInt(moodId))} ${getMoodLabel(parseInt(moodId))}`,
    value: count,
    moodId: parseInt(moodId)
  })) : [];

  return (
    <div className="p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 心情统计卡片 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">本月心情统计</h3>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : moodStats ? (
              <div className="space-y-4">
                {/* 心情饼图 */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value}天`, '记录天数']}
                        labelFormatter={(label) => label.split(' ')[1]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">记录天数</div>
                    <div className="text-xl font-semibold">{moodStats.daysWithMood}天</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">最多心情</div>
                    <div className="text-xl font-semibold flex items-center">
                      {moodStats.mostFrequentMood ? (
                        <>
                          <span className="mr-2">{getMoodEmoji(moodStats.mostFrequentMood)}</span>
                          {getMoodLabel(moodStats.mostFrequentMood)}
                        </>
                      ) : (
                        '暂无数据'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                暂无心情数据
              </div>
            )}
          </div>

          {/* 任务完成情况卡片 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">本月任务完成情况</h3>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : todoStats ? (
              <div className="space-y-4">
                {/* 进度条 */}
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        月度得分
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {todoStats.score}分
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${todoStats.score}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                    />
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">总天数</div>
                    <div className="text-xl font-semibold">{todoStats.totalDays}天</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">全部完成</div>
                    <div className="text-xl font-semibold">{todoStats.completedDays}天</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">部分完成</div>
                    <div className="text-xl font-semibold">{todoStats.partialCompletedDays}天</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                暂无任务数据
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 