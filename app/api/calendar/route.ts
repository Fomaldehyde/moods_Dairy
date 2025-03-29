import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface DayData {
  date: Date;
  mood: { emoji: string } | null;
  todos: { completed: boolean }[];
}

export async function GET() {
  try {
    // 获取所有有记录的日期
    const days = await prisma.day.findMany({
      select: {
        date: true,
        mood: {
          select: {
            emoji: true,
          },
        },
        todos: {
          select: {
            completed: true,
          },
        },
      },
    }) as DayData[];

    // 处理数据，计算每个日期的完成状态
    const calendarData = days.map((day: DayData) => {
      const totalTodos = day.todos.length;
      const completedTodos = day.todos.filter((todo: { completed: boolean }) => todo.completed).length;
      
      let status = null; // 默认不显示颜色
      if (totalTodos > 0) {
        if (completedTodos === totalTodos) {
          status = 'green'; // 全部完成
        } else if (completedTodos > 0) {
          status = 'yellow'; // 部分完成
        } else {
          status = 'red'; // 有待办事项但一个都没完成
        }
      }

      return {
        date: day.date,
        mood: day.mood?.emoji || null,
        status,
      };
    });

    return NextResponse.json(calendarData);
  } catch (error) {
    console.error('获取日历数据失败:', error);
    return NextResponse.json(
      { error: '获取日历数据失败' },
      { status: 500 }
    );
  }
} 