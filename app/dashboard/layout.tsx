'use client';

import Sidebar from '../components/Sidebar';
import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import HomePage from './home/page';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const pathname = usePathname();
  const isHomePage = pathname === '/dashboard/home';

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onDateSelect={setSelectedDate} />
      <main className="flex-1 p-6 overflow-auto">
        {isHomePage ? (
          <HomePage selectedDate={selectedDate} />
        ) : (
          children
        )}
      </main>
    </div>
  );
} 