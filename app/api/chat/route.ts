import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 获取聊天记录
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dayId = searchParams.get('dayId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!dayId) {
      console.log('缺少 dayId 参数');
      return NextResponse.json({ error: '缺少 dayId 参数' }, { status: 400 });
    }

    const dayIdInt = parseInt(dayId);
    console.log('查询聊天记录，dayId:', dayIdInt, 'page:', page, 'limit:', limit);

    // 先验证 day 记录是否存在
    const day = await prisma.day.findUnique({
      where: { id: dayIdInt }
    });

    if (!day) {
      console.log('找不到对应的日期记录:', dayIdInt);
      return NextResponse.json({ chats: [], hasMore: false });
    }

    // 获取总记录数
    const total = await prisma.chat.count({
      where: { dayId: dayIdInt }
    });

    // 获取指定日期的聊天记录
    const chats = await prisma.chat.findMany({
      where: {
        dayId: dayIdInt
      },
      orderBy: {
        createdAt: 'desc' // 倒序，最新的在前
      },
      take: limit,
      skip: skip
    });

    console.log('获取到的聊天记录:', chats.length);
    return NextResponse.json({
      chats: chats.reverse(), // 返回给前端时再反转回正序
      hasMore: total > skip + limit,
      total
    });
  } catch (error) {
    console.error('获取聊天记录失败:', error);
    return NextResponse.json({ error: '获取聊天记录失败' }, { status: 500 });
  }
}

// 创建新的聊天记录
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, dayId } = body;

    if (!content || !dayId) {
      console.log('缺少必要参数:', { content, dayId });
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const dayIdInt = parseInt(dayId);

    // 先验证 day 记录是否存在
    const day = await prisma.day.findUnique({
      where: { id: dayIdInt }
    });

    if (!day) {
      console.log('找不到对应的日期记录:', dayIdInt);
      return NextResponse.json({ error: '找不到对应的日期记录' }, { status: 404 });
    }

    // 创建新的聊天记录
    const chat = await prisma.chat.create({
      data: {
        content,
        dayId: dayIdInt
      }
    });

    console.log('新创建的聊天记录:', chat);
    return NextResponse.json(chat);
  } catch (error) {
    console.error('创建聊天记录失败:', error);
    return NextResponse.json({ error: '创建聊天记录失败' }, { status: 500 });
  }
}