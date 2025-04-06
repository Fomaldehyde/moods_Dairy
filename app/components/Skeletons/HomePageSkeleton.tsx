'use client';

export default function HomePageSkeleton() {
  return (
    <div className="p-4 animate-pulse">
      {/* 标题骨架 */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 心情统计卡片骨架 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {/* 饼图骨架 */}
            <div className="h-64 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-gray-200"></div>
            </div>
            {/* 统计信息骨架 */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 任务完成情况卡片骨架 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {/* 进度条骨架 */}
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-8 bg-gray-200 rounded"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
            {/* 统计信息骨架 */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg">
                  <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 