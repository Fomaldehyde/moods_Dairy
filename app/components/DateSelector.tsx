'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onChange }: DateSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleDateClick = () => {
    setIsEditing(!isEditing);
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    onChange(date);
    setIsEditing(false);
  };

  const year = format(selectedDate, 'yyyy');
  const month = format(selectedDate, 'MM');
  const day = format(selectedDate, 'dd');

  return (
    <div className="relative">
      <div className="text-center cursor-pointer">
        <div className="flex flex-col items-center">
          {/* 年月行 */}
          <div className="text-1xl mb-1">
            <span>{year}</span>
            <span className="mx-1">年</span>
            <span>{month}</span>
            <span className="mx-1">月</span>
          </div>
          {/* 日期行 */}
          <div className="text-5xl font-bold">
            <span 
              className="hover:text-blue-600 transition-colors"
              onClick={handleDateClick}
            >
              {day}
            </span>
            <span className="mx-2">日</span>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              inline
              locale={zhCN}
              dateFormat="yyyy/MM/dd"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={15}
              scrollableYearDropdown
              showPopperArrow={false}
              popperClassName="react-datepicker-popper"
              popperPlacement="bottom"
            />
          </div>
        </div>
      )}
    </div>
  );
} 