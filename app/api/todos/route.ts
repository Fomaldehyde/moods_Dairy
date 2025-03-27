import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/auth';

// 获取待办事项
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
      
      const todos = await prisma.todo.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      return NextResponse.json({ todos });
    } else {
      // 如果没有指定日期，返回所有待办事项
      const todos = await prisma.todo.findMany({
        where: {
          userId,
        },
        orderBy: {
          date: 'desc',
        },
      });
      
      return NextResponse.json({ todos });
    }
  } catch (error) {
    console.error('获取待办事项失败:', error);
    return NextResponse.json(
      { error: '获取待办事项失败' },
      { status: 500 }
    );
  }
}

// 创建待办事项
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    const { title, completed, date, comment } = await request.json();
    
    const todo = await prisma.todo.create({
      data: {
        title,
        completed: completed || false,
        date: date ? new Date(date) : new Date(),
        comment,
        userId,
      },
    });
    
    return NextResponse.json({ todo });
  } catch (error) {
    console.error('创建待办事项失败:', error);
    return NextResponse.json(
      { error: '创建待办事项失败' },
      { status: 500 }
    );
  }
} 