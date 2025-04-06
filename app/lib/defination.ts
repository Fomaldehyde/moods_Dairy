export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type Day = {
  id: number;
  date: string;
  mood: string;
  moodId: number;
};

export type Diary = {
  id: number;
  content: string;
  dayId: number;
  createdAt: string;
  updatedAt: string;
};

export type Mood = {
  id: number;
  label: string;
  emoji: string;
  weight: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export type ChatMessage = {
  id: number;
  content: string;
  dayId: number;
  createdAt: string;
  updatedAt: string;
};





