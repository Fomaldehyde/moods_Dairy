export interface Mood {
    emoji: string
    label: string
    color_code: string
  }
  
  export interface Day {
    date: string // YYYY-MM-DD
    moodEmoji: string
  }
  
  export interface Chat {
    dayDate: string
    content: string
    time: string // HH:mm:ss
    moodEmoji?: string
    isMarkdown: boolean
  }
  
  export interface Todo {
    dayDate: string
    content: string
    completed: boolean
  }
  
  export const moods: Mood[] = [
    { emoji: '😊', label: '开心', color_code: '#FFD700' },
    { emoji: '😢', label: '难过', color_code: '#4169E1' },
    { emoji: '😡', label: '生气', color_code: '#FF4500' },
    { emoji: '🤔', label: '思考', color_code: '#808080' },
    { emoji: '💪', label: '干劲', color_code: '#32CD32' },
    { emoji: '🍃', label: '无心情', color_code: '#D3D3D3' }
  ]
  
  export const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: '123456'
  }
  
  export const testDays: Day[] = [
    { date: '2024-03-25', moodEmoji: '🍃' },
    { date: '2024-03-26', moodEmoji: '😊' },
    { date: '2024-03-27', moodEmoji: '🤔' }
  ]
  
  export const testChats: Chat[] = [
    {
      dayDate: '2024-03-26',
      content: '今天完成了一个大项目！',
      time: '09:30:00',
      moodEmoji: '😊',
      isMarkdown: false
    },
    {
      dayDate: '2024-03-26',
      content: '# 明日计划\n- [ ] 项目复盘',
      time: '14:00:00',
      isMarkdown: true
    }
  ]
  
  export const testTodos: Todo[] = [
    {
      dayDate: '2024-03-26',
      content: '项目总结报告',
      completed: true
    },
    {
      dayDate: '2024-03-27',
      content: '技术方案设计',
      completed: false
    }
  ]