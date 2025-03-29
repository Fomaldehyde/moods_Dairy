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

    // 将日期字符串转换为 Date 对象，并设置为当天的开始时间
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    console.log('处理日期:', dateObj.toISOString());
    console.log('用户ID:', userId);

    // 查找或创建指定日期的记录
    const day = await prisma.day.upsert({
      where: {
        date_userId: {
          date: dateObj,
          userId: userId
        }
      },
      create: {
        date: dateObj,
        userId: userId
      },
      update: {}
    });

    console.log('获取到的日期记录:', day);
    return NextResponse.json({ day });
  } catch (error) {
    console.error('获取日期记录失败，详细错误:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: '获取日期记录失败' }, { status: 500 });
  }
} 