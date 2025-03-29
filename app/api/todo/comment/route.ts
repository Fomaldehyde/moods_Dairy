import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 添加评论
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, todoId } = body;

    if (!content || !todoId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const comment = await prisma.todoComment.create({
      data: {
        content,
        todoId: parseInt(todoId),
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('添加评论失败:', error);
    return NextResponse.json(
      { error: '添加评论失败' },
      { status: 500 }
    );
  }
} 