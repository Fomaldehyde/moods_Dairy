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

    // 获取当月所有有心情记录的日期
    const daysWithMood = await prisma.day.findMany({
      where: {
        userId,
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      include: {
        mood: true
      }
    });

    // 统计心情数据
    const moodStats: { [key: number]: number } = {};
    let totalDays = 0;

    daysWithMood.forEach(day => {
      if (day.mood) {
        moodStats[day.mood.id] = (moodStats[day.mood.id] || 0) + 1;
        totalDays++;
      }
    });

    // 找出最多的心情
    let mostFrequentMood = null;
    let maxCount = 0;

    Object.entries(moodStats).forEach(([moodId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentMood = parseInt(moodId);
      }
    });

    return NextResponse.json({
      moodStats,
      totalDays,
      mostFrequentMood,
      daysWithMood: daysWithMood.length
    });
  } catch (error) {
    console.error('获取心情统计失败:', error);
    return NextResponse.json({ error: '获取心情统计失败' }, { status: 500 });
  }
} 