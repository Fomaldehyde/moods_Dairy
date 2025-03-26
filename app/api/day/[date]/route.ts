import { NextResponse } from 'next/server';
import pool from '@/app/utils/localPg';

export async function GET(req: Request, context: { params: { date: string } }) {
  try {
    // 使用 await 获取 context.params
    const { date } = await context.params;

    console.log('Fetching data for date:', date);

    // 查询当天的心情
    const moodResult = await pool.query(
      `
      SELECT m.emoji AS mood
      FROM days d
      LEFT JOIN moods m ON d.mood_id = m.id
      WHERE d.date = $1
      LIMIT 1;
      `,
      [date]
    );

    const mood = moodResult.rows[0]?.mood || '🍃'; // 如果没有心情，默认显示 🍃

    // 查询当天的待办事项
    const todosResult = await pool.query(
      `
      SELECT is_completed
      FROM todos
      WHERE day_id = (
        SELECT id FROM days WHERE date = $1 LIMIT 1
      );
      `,
      [date]
    );

    const todos = todosResult.rows;

    // 计算待办状态
    let todoStatus: 'none' | 'allCompleted' | 'noneCompleted' | 'partiallyCompleted' = 'none';
    if (todos.length > 0) {
      const completedCount = todos.filter((todo) => todo.is_completed).length;
      if (completedCount === todos.length) {
        todoStatus = 'allCompleted'; // 全部完成
      } else if (completedCount === 0) {
        todoStatus = 'noneCompleted'; // 全部未完成
      } else {
        todoStatus = 'partiallyCompleted'; // 部分完成
      }
    }

    return NextResponse.json({ date, mood, todoStatus });
  } catch (error) {
    console.error('Error fetching day data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch day data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}