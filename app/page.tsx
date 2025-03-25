import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-16 text-center">
        {/* 标题部分 */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 md:text-6xl">
            智能日记助手
          </h1>
          <p className="text-xl text-gray-600 mb-8 md:text-2xl">
            记录生活点滴，AI赋能自我成长
          </p>
        </div>

        {/* 功能亮点展示 */}
        <div className="grid gap-8 mb-16 md:grid-cols-3 md:gap-12">
          {[
            { title: '智能分析', desc: '自动识别心情与重点' },
            { title: '日历视图', desc: '时间轴回顾生活轨迹' }, 
            { title: '任务管理', desc: '自动提取待办事项' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-6 bg-white rounded-xl shadow-lg transition-all hover:shadow-xl"
            >
              <div className="text-blue-600 text-3xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* 登录入口 */}
        <div className="animate-slide-up">
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg 
                     text-lg font-medium hover:bg-blue-700 transition-colors
                     shadow-lg hover:shadow-xl"
          >
            立即开始 →
          </Link>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="mt-24 pb-8 text-center text-gray-500">
        <p>© 2024 SmartDiary. All rights reserved.</p>
      </footer>
    </div>
  )
}