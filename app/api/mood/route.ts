import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 获取指定日期的心情
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');

    if (!date || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 直接使用日期字符串，不进行时区转换
    const dateObj = new Date(date);
    console.log('处理日期mood:', date);

    // 查找指定日期的记录
    const day = await prisma.day.findFirst({
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

    if (!day) {
      return NextResponse.json({ mood: null });
    }

    return NextResponse.json({ mood: day.moodId });
  } catch (error) {
    console.error('获取心情失败:', error);
    return NextResponse.json({ error: '获取心情失败' }, { status: 500 });
  }
}

// 更新指定日期的心情
export async function PUT(request: Request) {
  try {
    const { date, moodId, userId } = await request.json();

    if (!date || !moodId || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 直接使用日期字符串，不进行时区转换
    const dateObj = new Date(date);

    // 查找或创建日期记录
    let day = await prisma.day.findFirst({
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

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: dateObj,
          userId: userId,
          moodId: moodId
        }
      });
    } else {
      day = await prisma.day.update({
        where: { id: day.id },
        data: { moodId: moodId }
      });
    }

    return NextResponse.json({ mood: day.moodId });
  } catch (error) {
    console.error('更新心情失败:', error);
    return NextResponse.json({ error: '更新心情失败' }, { status: 500 });
  }
} 