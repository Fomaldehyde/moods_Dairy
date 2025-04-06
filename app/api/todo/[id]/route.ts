import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Todo } from '@/app/lib/defination';

type TodoUpdateData = Partial<Pick<Todo, 'title' | 'completed'>>;

// 更新待办事项
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, completed } = body;
    const id = parseInt(params.id);

    if (!id) {
      return NextResponse.json(
        { error: '无效的待办事项ID' },
        { status: 400 }
      );
    }

    const updateData: TodoUpdateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    const todo = await prisma.todo.update({
      where: { id },
      data: updateData,
      include: {
        comments: true,
      },
    });

    return NextResponse.json({ todo });
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
    const id = parseInt(await params.id);

    if (!id) {
      return NextResponse.json(
        { error: '无效的待办事项ID' },
        { status: 400 }
      );
    }

    // 删除待办事项
    await prisma.todo.delete({
      where: { id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除待办事项失败:', error);
    return NextResponse.json(
      { error: '删除待办事项失败' },
      { status: 500 }
    );
  }
} 