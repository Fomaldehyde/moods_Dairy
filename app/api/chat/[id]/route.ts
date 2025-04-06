import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  context: { params: { id: string } } // 使用 context 参数
) {
  try {
    const params = await context.params; // 确保异步解析 params
    const { id } = params; // 解构 id

    // 删除消息
    await prisma.chat.delete({
      where: {
        id: parseInt(id), // 确保 id 是数字
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除消息失败:', error);
    return NextResponse.json(
      { error: '删除消息失败' },
      { status: 500 }
    );
  }
}