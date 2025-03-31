import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (!userId || !date) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 解析日期，获取当月第一天和最后一天
    const currentDate = new Date(date);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // 获取当月所有日期
    const days = await prisma.day.findMany({
      where: {
        userId,
        date: {
          gte: monthStart,
          lte: monthEnd
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
      if (todos.length === 0) return;

      const completedTodos = todos.filter(todo => todo.completed).length;
      const completionRate = completedTodos / todos.length;

      if (completionRate === 1) {
        completedDays++;
      } else if (completionRate > 0) {
        partialCompletedDays++;
      }
    });

    // 计算月度得分
    const score = Math.round(
      ((completedDays + partialCompletedDays * 0.5) / totalDays) * 100
    );

    return NextResponse.json({
      score,
      completedDays,
      partialCompletedDays,
      totalDays
    });
  } catch (error) {
    console.error('获取任务统计失败:', error);
    return NextResponse.json({ error: '获取任务统计失败' }, { status: 500 });
  }
} 