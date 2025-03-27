import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/auth';

// 获取日记
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
    const dateParam = searchParams.get('date');
    
    let date;
    if (dateParam) {
      date = new Date(dateParam);
      // 设置日期范围
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const diaries = await prisma.diary.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
      
      return NextResponse.json({ diaries });
    } else {
      // 如果没有指定日期，返回所有日记
      const diaries = await prisma.diary.findMany({
        where: {
          userId,
        },
        orderBy: {
          date: 'desc',
        },
      });
      
      return NextResponse.json({ diaries });
    }
  } catch (error) {
    console.error('获取日记失败:', error);
    return NextResponse.json(
      { error: '获取日记失败' },
      { status: 500 }
    );
  }
}

// 创建日记
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    const { content, mood, date } = await request.json();
    
    const diary = await prisma.diary.create({
      data: {
        content,
        mood,
        date: date ? new Date(date) : new Date(),
        userId,
      },
    });
    
    return NextResponse.json({ diary });
  } catch (error) {
    console.error('创建日记失败:', error);
    return NextResponse.json(
      { error: '创建日记失败' },
      { status: 500 }
    );
  }
} 