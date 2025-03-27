import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 获取测试用户的ID
async function getTestUserId() {
  const user = await prisma.user.findUnique({
    where: {
      email: 'test@example.com',
    },
  });
  return user?.id;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: '日期参数是必需的' },
        { status: 400 }
      );
    }

    const userId = await getTestUserId();
    if (!userId) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const day = await prisma.day.findFirst({
      where: {
        date: new Date(date),
        userId,
      },
      include: {
        mood: true,
      },
    });

    return NextResponse.json({
      mood: day?.mood?.emoji || null,
      moodId: day?.moodId || null,
    });
  } catch (error) {
    console.error('获取心情失败:', error);
    return NextResponse.json(
      { error: '获取心情失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const { moodId } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: '日期参数是必需的' },
        { status: 400 }
      );
    }

    const userId = await getTestUserId();
    if (!userId) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 查找或创建当天的记录
    const day = await prisma.day.upsert({
      where: {
        date_userId: {
          date: new Date(date),
          userId,
        },
      },
      create: {
        date: new Date(date),
        userId,
        moodId,
      },
      update: {
        moodId,
      },
      include: {
        mood: true,
      },
    });

    return NextResponse.json({
      mood: day.mood?.emoji || null,
      moodId: day.moodId,
    });
  } catch (error) {
    console.error('更新心情失败:', error);
    return NextResponse.json(
      { error: '更新心情失败' },
      { status: 500 }
    );
  }
} 