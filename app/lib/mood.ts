import { Mood } from './defination';

export const moodEmojis: Record<string, Mood> = {
  SAD: { emoji: "😢", label: "难过", id: 1, weight: 1 },
  ANGRY: { emoji: "😡", label: "生气", id: 2, weight: 2 },
  ANXIOUS: { emoji: "😰", label: "焦虑", id: 3, weight: 3 },
  TIRED: { emoji: "😫", label: "疲惫", id: 4, weight: 4 },
  NEUTRAL: { emoji: "😐", label: "平静", id: 5, weight: 5 },
  PEACEFUL: { emoji: "😌", label: "平和", id: 6, weight: 6 },
  HAPPY: { emoji: "😊", label: "开心", id: 7, weight: 7 },
  EXCITED: { emoji: "🤩", label: "兴奋", id: 8, weight: 8 },
}; 