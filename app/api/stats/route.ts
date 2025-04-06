import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/auth';
import { startOfMonth, endOfMonth, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

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
    
    // 设置月份范围（使用UTC时间）
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(Date.UTC(year, month, 0));
    endDate.setUTCHours(23, 59, 59, 999);
    
    // 获取心情统计
    const daysWithMood = await prisma.day.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        mood: {
          isNot: null
        }
      },
      include: {
        mood: true
      }
    });
    
    // 计算每种心情的天数
    const moodCounts: Record<string, number> = {};
    daysWithMood.forEach((day) => {
      if (day.mood) {
        const moodId = day.mood.id.toString();
        moodCounts[moodId] = (moodCounts[moodId] || 0) + 1;
      }
    });
    
    // 获取待办事项完成情况
    const days = await prisma.day.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        todos: true
      }
    });
    
    // 计算任务完成情况
    let completedDays = 0;
    let partialCompletedDays = 0;
    const totalDays = days.length;
    
    days.forEach(day => {
      const todos = day.todos;
      if (todos.length === 0) {
        completedDays++; // 没有待办事项的日期计入全部完成
      } else {
        const completedTodos = todos.filter(todo => todo.completed).length;
        const completionRate = completedTodos / todos.length;
        
        if (completionRate === 1) {
          completedDays++;
        } else if (completionRate > 0) {
          partialCompletedDays++;
        }
      }
    });
    
    // 计算任务得分
    const todoScore = totalDays > 0 ? Math.round(((completedDays + partialCompletedDays * 0.5) / totalDays) * 100) : 0;
    
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
        total: totalDays,
        completed: completedDays,
        partialCompleted: partialCompletedDays,
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