'use client';

import { useState, useEffect} from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { moodEmojis } from '@/app/lib/mood';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import HomePageSkeleton from '@/app/components/Skeletons/HomePageSkeleton';

interface MoodStats {
  moodStats: { [key: number]: number };
  totalDays: number;
  mostFrequentMood: number | null;
  daysWithMood: number;
}

interface MoodTrend {
  date: string;
  moodId: number | null;
  emoji: string | null;
  label: string | null;
  weight: number | null;
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

// 预加载数据函数
const prefetchData = async (userId: string, date: string) => {
  const urls = [
    `/api/mood/stats?userId=${encodeURIComponent(userId)}&date=${date}`,
    `/api/todo/stats?userId=${encodeURIComponent(userId)}&date=${date}`
  ];
  
  return Promise.all(urls.map(url => 
    fetch(url, {
      // 添加预加载头
      headers: {
        'Purpose': 'prefetch',
        'Cache-Control': 'max-age=300' // 缓存5分钟
      }
    })
  ));
};

export default function HomePage({ selectedDate }: HomePageProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [todoStats, setTodoStats] = useState<TodoStats | null>(null);
  const [moodTrend, setMoodTrend] = useState<MoodTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 当选择的日期改变时更新 currentDate
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  // 数据预加载
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    if (!user.id) return;

    // 预加载下个月的数据
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = format(nextMonth, 'yyyy-MM-dd');
    prefetchData(user.id, nextMonthStr).catch(console.error);
  }, [currentDate]);

  // 获取当前数据
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error('用户未登录');
        
        const user = JSON.parse(userStr);
        if (!user.id) throw new Error('用户信息不完整');

        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        // 使用 AbortController 处理请求取消
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        const [moodResponse, todoResponse, trendResponse] = await Promise.all([
          fetch(`/api/mood/stats?userId=${encodeURIComponent(user.id)}&date=${dateStr}`, {
            signal: controller.signal
          }),
          fetch(`/api/todo/stats?userId=${encodeURIComponent(user.id)}&date=${dateStr}`, {
            signal: controller.signal
          }),
          fetch(`/api/mood/trend?userId=${encodeURIComponent(user.id)}`, {
            signal: controller.signal
          })
        ]);
        
        clearTimeout(timeout);
        
        if (!moodResponse.ok) throw new Error('获取心情统计失败');
        if (!todoResponse.ok) throw new Error('获取任务统计失败');
        if (!trendResponse.ok) throw new Error('获取心情趋势失败');
        
        const [moodData, todoData, trendData] = await Promise.all([
          moodResponse.json(),
          todoResponse.json(),
          trendResponse.json()
        ]);
        
        setMoodStats(moodData);
        setTodoStats(todoData);
        setMoodTrend(trendData.map((item: Omit<MoodTrend, 'weight'>) => ({
          ...item,
          weight: item.moodId ? Object.values(moodEmojis).find(m => m.id === item.moodId)?.weight || null : null
        })));
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('获取数据失败');
        }
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

  // 如果正在加载，显示骨架屏
  if (loading) {
    return <HomePageSkeleton />;
  }

  // 如果有错误，显示错误信息
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
    <div className="p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 心情统计卡片 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">本月心情统计</h3>
            {moodStats ? (
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

          {/* 心情趋势卡片 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">最近10天心情趋势</h3>
            {moodTrend.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => date.split('-').slice(1).join('-')}
                    />
                    <YAxis 
                      domain={[0, 9]}
                      tickCount={10}
                    />
                    <Tooltip 
                      formatter={(value: number) => {
                        const mood = Object.values(moodEmojis).find(m => m.weight === value);
                        return [mood ? `${mood.emoji} ${mood.label}` : '无记录', '心情'];
                      }}
                      labelFormatter={(label) => label}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#8884d8" 
                      dot={true}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                暂无心情趋势数据
              </div>
            )}
          </div>

          {/* 任务完成情况卡片 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">本月任务完成情况</h3>
            {todoStats ? (
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