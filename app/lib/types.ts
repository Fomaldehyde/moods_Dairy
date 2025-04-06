export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  dayId: number;
  comments: TodoComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoComment {
  id: number;
  content: string;
  todoId: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiaryEntry {
  id: number;
  content: string;
  dayId: number;
  createdAt: string;
  updatedAt: string;
}

export interface DayMood {
  mood: string | null;
  moodId: number | null;
} 