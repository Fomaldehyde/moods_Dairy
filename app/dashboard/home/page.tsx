'use client';

import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// 心情图标映射
const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  excited: "🤩",
  tired: "😴",
  neutral: "😐",
};

export default function HomePage() {
  const [todoScore, setTodoScore] = useState(0);
  const [dominantMood, setDominantMood] = useState("neutral");
  const [habitStats, setHabitStats] = useState<{mood: string, count: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 这里会从API获取数据，现在用模拟数据
    const fetchData = async () => {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟数据
        const mockMoodData = [
          { mood: 'happy', count: 12 },
          { mood: 'sad', count: 5 },
          { mood: 'angry', count: 3 },
          { mood: 'excited', count: 8 },
          { mood: 'tired', count: 6 },
          { mood: 'neutral', count: 10 },
        ];
        
        // 找出占比最大的心情
        const maxMood = mockMoodData.reduce((max, current) => 
          current.count > max.count ? current : max, mockMoodData[0]);
        
        setHabitStats(mockMoodData);
        setDominantMood(maxMood.mood);
        
        // 模拟Todo完成情况，计算分数
        const totalTodos = 45;
        const completedTodos = 37;
        const score = Math.round((completedTodos / totalTodos) * 100);
        setTodoScore(score);
        
        setIsLoading(false);
      } catch (error) {
        console.error('获取数据失败:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // 为图表准备数据
  const moodChartData = {
    labels: habitStats.map(item => `${moodEmojis[item.mood]} ${item.mood}`),
    datasets: [
      {
        label: '天数',
        data: habitStats.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">加载中...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">本月概览</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">心情统计</h2>
          <div className="h-64">
            <Doughnut data={moodChartData} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg">本月主要心情: {moodEmojis[dominantMood]} {dominantMood}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">待办事项完成情况</h2>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative w-48 h-48">
              <div className="w-full h-full rounded-full bg-gray-200"></div>
              <div 
                className="absolute top-0 left-0 w-full h-full rounded-full bg-green-500"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${todoScore >= 25 ? '100% 0%' : `${50 + 50 * todoScore / 25}% ${50 - 50 * todoScore / 25}%`}${todoScore >= 50 ? ', 100% 100%' : ''}${todoScore >= 75 ? ', 0% 100%' : ''}${todoScore >= 100 ? ', 0% 0%' : ''})` 
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{todoScore}</span>
              </div>
            </div>
            <p className="mt-4 text-lg">完成得分 (满分100)</p>
          </div>
        </div>
      </div>
    </div>
  );
} 