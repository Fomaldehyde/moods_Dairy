import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 清空现有数据
  await prisma.chat.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.day.deleteMany();
  await prisma.mood.deleteMany();
  await prisma.user.deleteMany();

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: '测试用户',
      email: 'test@example.com',
      password: hashedPassword,
    },
  });

  // 插入心情数据
  const moods = [
    { emoji: '😊', label: '开心', value: 'HAPPY' },
    { emoji: '😢', label: '难过', value: 'SAD' },
    { emoji: '😠', label: '生气', value: 'ANGRY' },
    { emoji: '😐', label: '平静', value: 'NEUTRAL' },
    { emoji: '🤩', label: '兴奋', value: 'EXCITED' },
    { emoji: '😫', label: '疲惫', value: 'TIRED' },
    { emoji: '😌', label: '平和', value: 'PEACEFUL' },
    { emoji: '😰', label: '焦虑', value: 'ANXIOUS' },
  ];

  for (const mood of moods) {
    await prisma.mood.create({
      data: mood,
    });
  }

  // 插入测试数据
  const today = new Date();
  const happyMood = await prisma.mood.findUnique({ where: { value: 'HAPPY' } });
  
  if (happyMood) {
    // 创建今天的记录
    const day = await prisma.day.create({
      data: {
        date: today,
        userId: user.id,
        moodId: happyMood.id,
      },
    });

    // 创建聊天记录
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

    // 创建待办事项
    await prisma.todo.createMany({
      data: [
        {
          title: '完成项目文档',
          completed: true,
          dayId: day.id,
        },
        {
          title: '代码审查',
          completed: false,
          dayId: day.id,
        },
        {
          title: '团队会议',
          completed: true,
          dayId: day.id,
        },
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 