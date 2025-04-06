import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, getDaysInMonth, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

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
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    
    // 计算四月的第一天和最后一天（使用 UTC 时间）
    const monthStart = new Date(Date.UTC(year, month, 1));
    monthStart.setUTCHours(0, 0, 0, 0); // 设置为当天的 00:00:00 UTC
    
    const monthEnd = new Date(Date.UTC(year, month + 1, 0));
    monthEnd.setUTCHours(23, 59, 59, 999); // 设置为当天的 23:59:59 UTC
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
    const totalDays = getDaysInMonth(currentDate); // 使用当月的实际天数

    // 创建一个Map来存储每天的完成状态
    const dayStatusMap = new Map();
    
    // 初始化所有日期的状态为未完成
    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      dayStatusMap.set(dayDate.toISOString().split('T')[0], 'incomplete');
    }

    // 更新有记录的日期的状态
    days.forEach(day => {
      const dayDate = day.date.toISOString().split('T')[0];
      const todos = day.todos;
      
      if (todos.length === 0) {
        //dayStatusMap.set(dayDate, 'completed');
      } else {
        const completedTodos = todos.filter(todo => todo.completed).length;
        const completionRate = completedTodos / todos.length;

        if (completionRate === 1) {
          console.log('complate day',day)
          dayStatusMap.set(dayDate, 'completed');
        } else if (completionRate > 0) {
          dayStatusMap.set(dayDate, 'partial');
        }
      }
    });

    // 统计完成情况
    dayStatusMap.forEach(status => {
      if (status === 'completed') {
        completedDays++;
      } else if (status === 'partial') {
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