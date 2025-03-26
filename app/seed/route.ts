import { Pool } from 'pg';
import { hash } from 'bcryptjs';
import dotenv from 'dotenv';
import { moods, testUser, testDays, testChats, testTodos } from '@/app/lib/seed-data';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seedMoods() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS moods (
      id SERIAL PRIMARY KEY,
      emoji VARCHAR(2) NOT NULL UNIQUE,
      label VARCHAR(20) NOT NULL UNIQUE,
      color_code CHAR(7) NOT NULL
    );
  `);

  const insertedMoods = await Promise.all(
    moods.map((mood) =>
      pool.query(
        `
        INSERT INTO moods (emoji, label, color_code)
        VALUES ($1, $2, $3)
        ON CONFLICT (emoji) DO NOTHING;
      `,
        [mood.emoji, mood.label, mood.color_code]
      )
    )
  );

  return insertedMoods;
}

async function seedUsers() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash CHAR(60) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const hashedPassword = await hash(testUser.password, 10);
  const insertedUser = await pool.query(
    `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO NOTHING
    RETURNING id;
  `,
    [testUser.username, testUser.email, hashedPassword]
  );

  return insertedUser.rows[0]?.id;
}

async function seedDays(userId: number) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS days (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      mood_id INT REFERENCES moods(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, date)
    );
  `);

  const insertedDays = await Promise.all(
    testDays.map((day) =>
      pool.query(
        `
        INSERT INTO days (user_id, date, mood_id)
        VALUES ($1, $2, (SELECT id FROM moods WHERE emoji = $3))
        ON CONFLICT (user_id, date) DO NOTHING
        RETURNING id, date;
      `,
        [userId, day.date, day.moodEmoji]
      )
    )
  );

  return insertedDays.map((result) => ({
    id: result.rows[0]?.id,
    date: result.rows[0]?.date,
  })).filter((day) => day.id && day.date);
}

async function seedChats(dayMap: { [date: string]: number }) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chats (
      id SERIAL PRIMARY KEY,
      day_id INT NOT NULL REFERENCES days(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_time TIME NOT NULL CHECK (
        created_time >= '00:00:00' AND created_time <= '23:59:59'
      ),
      mood_id INT REFERENCES moods(id),
      is_markdown BOOLEAN DEFAULT FALSE
    );
  `);

  const insertedChats = await Promise.all(
    testChats.map((chat) => {
      const dayId = dayMap[chat.dayDate];
      if (!dayId) return null;

      return pool.query(
        `
        INSERT INTO chats (day_id, content, created_time, mood_id, is_markdown)
        VALUES ($1, $2, $3, (SELECT id FROM moods WHERE emoji = $4), $5)
        ON CONFLICT DO NOTHING;
      `,
        [dayId, chat.content, chat.time, chat.moodEmoji || null, chat.isMarkdown]
      );
    })
  );

  return insertedChats.filter(Boolean);
}

async function seedTodos(dayMap: { [date: string]: number }) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      day_id INT NOT NULL REFERENCES days(id) ON DELETE CASCADE,
      content VARCHAR(255) NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const insertedTodos = await Promise.all(
    testTodos.map((todo) => {
      const dayId = dayMap[todo.dayDate];
      if (!dayId) return null;

      return pool.query(
        `
        INSERT INTO todos (day_id, content, is_completed)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING;
      `,
        [dayId, todo.content, todo.completed]
      );
    })
  );

  return insertedTodos.filter(Boolean);
}

export async function GET() {
  try {
    console.log('Starting database seeding...');

    // Seed moods
    await seedMoods();
    console.log('Moods seeded successfully.');

    // Seed users
    const userId = await seedUsers();
    if (!userId) throw new Error('Failed to seed user.');

    console.log('User seeded successfully.');

    // Seed days
    const days = await seedDays(userId);
    const dayMap = days.reduce((map, day) => {
      map[day.date] = day.id;
      return map;
    }, {} as { [date: string]: number });

    console.log('Days seeded successfully.');

    // Seed chats and todos
    await seedChats(dayMap);
    await seedTodos(dayMap);

    console.log('Chats and todos seeded successfully.');

    return new Response(JSON.stringify({ message: 'Database seeded successfully' }), { status: 200 });
  } catch (error) {
    console.error('Database seeding failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  } finally {
    await pool.end();
  }
}