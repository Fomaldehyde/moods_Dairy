import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 清空现有数据
  await prisma.todoComment.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.day.deleteMany();
  await prisma.mood.deleteMany();
  await prisma.user.deleteMany();

  // 创建测试用户
  const hashedPassword = await hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      name: 'user',
      email: 'user@nextmail.com',
      password: hashedPassword,
    },
  });

  // 创建心情选项
  const moods = await Promise.all([
    prisma.mood.create({ data: { emoji: '😊', label: '开心', value: 'HAPPY' } }),
    prisma.mood.create({ data: { emoji: '😢', label: '难过', value: 'SAD' } }),
    prisma.mood.create({ data: { emoji: '😡', label: '生气', value: 'ANGRY' } }),
    prisma.mood.create({ data: { emoji: '😐', label: '平静', value: 'NEUTRAL' } }),
    prisma.mood.create({ data: { emoji: '🤩', label: '兴奋', value: 'EXCITED' } }),
    prisma.mood.create({ data: { emoji: '😫', label: '疲惫', value: 'TIRED' } }),
    prisma.mood.create({ data: { emoji: '😌', label: '平和', value: 'PEACEFUL' } }),
    prisma.mood.create({ data: { emoji: '😰', label: '焦虑', value: 'ANXIOUS' } }),
  ]);

  // 创建示例日期记录
  const day = await prisma.day.create({
    data: {
      date: new Date('2025-03-27'),
      userId: user.id,
      moodId: moods[0].id, // 使用"开心"的心情
    },
  });

  // 创建示例聊天记录
  await prisma.chat.createMany({
    data: [
      {
        content: '今天天气真好！',
        dayId: day.id,
      },
      {
        content: '下午开会很顺利',
        dayId: day.id,
      },
      {
        content: '晚上和朋友聚餐很开心',
        dayId: day.id,
      },
    ],
  });

  // 创建示例待办事项和评论
  const todo1 = await prisma.todo.create({
    data: {
      title: '准备会议材料',
      completed: true,
      dayId: day.id,
    },
  });

  await prisma.todoComment.createMany({
    data: [
      {
        content: '需要准备PPT',
        todoId: todo1.id,
      },
      {
        content: '记得带上项目报告',
        todoId: todo1.id,
      },
    ],
  });

  const todo2 = await prisma.todo.create({
    data: {
      title: '健身',
      completed: false,
      dayId: day.id,
    },
  });

  await prisma.todoComment.create({
    data: {
      content: '记得带运动装备',
      todoId: todo2.id,
    },
  });

  const todo3 = await prisma.todo.create({
    data: {
      title: '购物清单',
      completed: false,
      dayId: day.id,
    },
  });

  await prisma.todoComment.createMany({
    data: [
      {
        content: '买水果',
        todoId: todo3.id,
      },
      {
        content: '买牛奶',
        todoId: todo3.id,
      },
      {
        content: '买面包',
        todoId: todo3.id,
      },
    ],
  });

  console.log('数据库初始化完成');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 