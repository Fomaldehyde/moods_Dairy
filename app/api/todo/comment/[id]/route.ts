import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 删除评论
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (!id) {
      return NextResponse.json(
        { error: '无效的评论ID' },
        { status: 400 }
      );
    }

    await prisma.todoComment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json(
      { error: '删除评论失败' },
      { status: 500 }
    );
  }
} 