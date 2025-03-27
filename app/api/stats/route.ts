import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/auth';

// 获取统计数据
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const yearMonth = searchParams.get('yearMonth'); // 格式: YYYY-MM
    
    if (!yearMonth) {
      return NextResponse.json(
        { error: '缺少yearMonth参数' },
        { status: 400 }
      );
    }
    
    const [year, month] = yearMonth.split('-').map(Number);
    
    // 设置月份范围
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    // 获取心情统计
    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        mood: true,
        date: true,
      },
    });
    
    // 计算每种心情的天数
    const moodCounts: Record<string, number> = {};
    diaries.forEach(diary => {
      moodCounts[diary.mood] = (moodCounts[diary.mood] || 0) + 1;
    });
    
    // 获取待办事项完成情况
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    
    const totalTodos = todos.length;
    const completedTodos = todos.filter(todo => todo.completed).length;
    const todoScore = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    
    // 找出占比最大的心情
    let dominantMood = 'neutral';
    let maxCount = 0;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    });
    
    return NextResponse.json({
      moodStats: Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count,
      })),
      dominantMood,
      todoStats: {
        total: totalTodos,
        completed: completedTodos,
        score: todoScore,
      },
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
} 