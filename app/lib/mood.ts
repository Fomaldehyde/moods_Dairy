import { Mood } from './defination';

export const moodEmojis: Record<string, Mood> = {
  SAD: { emoji: "😢", label: "难过", id: 1 },
  NEUTRAL: { emoji: "😐", label: "平静", id: 2 },
  EXCITED: { emoji: "🤩", label: "兴奋", id: 3 },
  ANGRY: { emoji: "😡", label: "生气", id: 4 },
  PEACEFUL: { emoji: "😌", label: "平和", id: 5 },
  ANXIOUS: { emoji: "😰", label: "焦虑", id: 6 },
  HAPPY: { emoji: "😊", label: "开心", id: 7 },
  TIRED: { emoji: "😫", label: "疲惫", id: 8 },
}; 