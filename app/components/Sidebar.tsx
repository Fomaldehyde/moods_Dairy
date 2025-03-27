'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  CalendarIcon, 
  ChatBubbleLeftIcon, 
  CheckCircleIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  
  // 如果URL中有日期参数则使用它，否则使用当前日期
  const [selectedDate, setSelectedDate] = useState(() => {
    return dateParam ? new Date(dateParam) : new Date();
  });
  
  // 当URL日期参数变化时更新选中日期
  useEffect(() => {
    if (dateParam) {
      setSelectedDate(new Date(dateParam));
    }
  }, [dateParam]);
  
  // 模拟用户数据，实际应用中从会话或API获取
  const userName = "用户名";

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      // 根据当前页面决定导航到哪个路径，但保持选中的日期
      const formattedDate = formatDateForUrl(date);
      if (pathname.includes('/dashboard/chat')) {
        router.push(`/dashboard/chat?date=${formattedDate}`);
      } else if (pathname.includes('/dashboard/todo')) {
        router.push(`/dashboard/todo?date=${formattedDate}`);
      } else {
        // 默认导航到日历页面
        router.push(`/dashboard/calendar?date=${formattedDate}`);
      }
    }
  };

  const handleLogout = () => {
    // 实现登出逻辑
    router.push('/login');
  };

  // 格式化日期为YYYY-MM-DD格式，避免时间戳差异
  const formatDateForUrl = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 构建带有日期参数的导航链接
  const getNavLink = (basePath: string) => {
    return `${basePath}?date=${formatDateForUrl(selectedDate)}`;
  };

  return (
    <div className="bg-white w-64 h-full shadow-lg flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">我的日记</h2>
        <p className="text-gray-500">欢迎, {userName}</p>
      </div>
      
      <div className="p-4 border-b">
        <div className="text-center mb-2">
          {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}
        </div>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          inline
          locale={zhCN}
          className="w-full"
        />
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard/home" 
              className={`flex items-center p-2 rounded-lg ${
                pathname === '/dashboard/home' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}>
              <HomeIcon className="h-5 w-5 mr-2" />
              首页
            </Link>
          </li>
          <li>
            <Link href={getNavLink('/dashboard/calendar')} 
              className={`flex items-center p-2 rounded-lg ${
                pathname === '/dashboard/calendar' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}>
              <CalendarIcon className="h-5 w-5 mr-2" />
              日历
            </Link>
          </li>
          <li>
            <Link href={getNavLink('/dashboard/chat')} 
              className={`flex items-center p-2 rounded-lg ${
                pathname === '/dashboard/chat' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}>
              <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
              聊天
            </Link>
          </li>
          <li>
            <Link href={getNavLink('/dashboard/todo')} 
              className={`flex items-center p-2 rounded-lg ${
                pathname === '/dashboard/todo' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              待办事项
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center p-2 w-full text-left text-red-500 hover:bg-red-50 rounded-lg"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
          登出
        </button>
      </div>
    </div>
  );
} 