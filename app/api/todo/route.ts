import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 获取待办事项列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dayId = searchParams.get('dayId');

    if (!dayId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const todos = await prisma.todo.findMany({
      where: {
        dayId: parseInt(dayId),
      },
      include: {
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ todos });
  } catch (error) {
    console.error('获取待办事项失败:', error);
    return NextResponse.json(
      { error: '获取待办事项失败' },
      { status: 500 }
    );
  }
}

// 创建新的待办事项
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, dayId } = body;

    if (!title || !dayId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        dayId: parseInt(dayId),
        completed: false,
      },
      include: {
        comments: true,
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