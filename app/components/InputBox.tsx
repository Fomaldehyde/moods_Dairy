'use client';

import { useState, useRef, useEffect } from 'react';

interface InputBoxProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  initialValue?: string;
}

export default function InputBox({ 
  onSubmit, 
  placeholder = '请输入...', 
  buttonText = '发送',
  className = '',
  initialValue = ''
}: InputBoxProps) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当 initialValue 变化时更新 content
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? '发送中...' : buttonText}
      </button>
    </form>
  );
}