export interface DayData {
  date: string;
  mood: string; // 心情 emoji
  todoStatus: 'none' | 'allCompleted' | 'noneCompleted' | 'partiallyCompleted'; // 待办状态
}

// 获取某一天的心情和待办状态
export async function getDayData(date: string): Promise<DayData | null> {
  try {
    const response = await fetch(`/api/day/${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch day data');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching day data:', error);
    return null;
  }
}