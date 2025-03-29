import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 获取或创建指定日期的记录
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');

    if (!date || !userId) {
      console.log('缺少必要参数', { date, userId });
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('用户不存在:', userId);
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 直接使用日期字符串，不进行时区转换
    const dateObj = new Date(date);
    console.log('处理日期:', date);
    console.log('转换后的日期:', dateObj.toISOString());
    console.log('用户ID:', userId);

    // 查找指定日期的记录
    const existingDay = await prisma.day.findFirst({
      where: {
        AND: [
          { userId: userId },
          {
            date: {
              gte: dateObj,
              lt: new Date(new Date(dateObj).setDate(dateObj.getDate() + 1))
            }
          }
        ]
      }
    });

    if (existingDay) {
      console.log('找到已存在的日期记录:', existingDay);
      return NextResponse.json({ day: existingDay });
    }

    // 如果记录不存在，创建新记录
    const newDay = await prisma.day.create({
      data: {
        date: dateObj,
        userId: userId
      }
    });

    console.log('创建新的日期记录:', newDay);
    return NextResponse.json({ day: newDay });
  } catch (error) {
    console.error('获取日期记录失败，详细错误:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: '获取日期记录失败' }, { status: 500 });
  }
} 