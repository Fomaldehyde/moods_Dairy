import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, format } from 'date-fns';
import { moodEmojis } from '@/app/lib/mood';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 获取最近10天的日期范围
    const endDate = new Date();
    const startDate = subDays(endDate, 9); // 获取最近10天

    // 获取这段时间内的所有心情记录
    const days = await prisma.day.findMany({
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
      },
      orderBy: {
        date: 'asc'
      }
    });

    // 处理数据，确保包含所有日期
    const trendData = [];
    for (let i = 0; i < 10; i++) {
      const currentDate = subDays(endDate, 9 - i);
      const dayRecord = days.find(day => 
        format(day.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
      );

      const mood = dayRecord?.mood ? Object.values(moodEmojis).find(m => m.id === dayRecord.mood.id) : null;

      trendData.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        moodId: dayRecord?.mood?.id || null,
        emoji: mood?.emoji || null,
        label: mood?.label || null,
        weight: mood?.weight || null
      });
    }

    return NextResponse.json(trendData);
  } catch (error) {
    console.error('获取心情趋势失败:', error);
    return NextResponse.json({ error: '获取心情趋势失败' }, { status: 500 });
  }
} 