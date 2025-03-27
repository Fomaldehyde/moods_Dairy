import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/auth';

// 更新待办事项
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const updates = await request.json();
    
    // 验证待办事项属于当前用户
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId,
      },
    });
    
    if (!existingTodo) {
      return NextResponse.json(
        { error: '待办事项不存在或无权限' },
        { status: 404 }
      );
    }
    
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: updates,
    });
    
    return NextResponse.json({ todo: updatedTodo });
  } catch (error) {
    console.error('更新待办事项失败:', error);
    return NextResponse.json(
      { error: '更新待办事项失败' },
      { status: 500 }
    );
  }
}

// 删除待办事项
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // 验证待办事项属于当前用户
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId,
      },
    });
    
    if (!existingTodo) {
      return NextResponse.json(
        { error: '待办事项不存在或无权限' },
        { status: 404 }
      );
    }
    
    await prisma.todo.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除待办事项失败:', error);
    return NextResponse.json(
      { error: '删除待办事项失败' },
      { status: 500 }
    );
  }
} 