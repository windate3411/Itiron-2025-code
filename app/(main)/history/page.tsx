'use client';
import { mockPracticeHistory } from '@/app/lib/mockData';
import { Code, MessageSquare, Clock, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function PracticeHistoryPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">練習紀錄</h2>
      <div className="space-y-4">
        {mockPracticeHistory.map((item) => (
          <Link
            href={`/history/${item.id}`}
            key={item.id}
            className="bg-gray-800 p-4 rounded-lg flex items-center justify-between hover:bg-gray-700/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {item.type === '程式實作' ? (
                <Code className="text-purple-400" />
              ) : (
                <MessageSquare className="text-blue-400" />
              )}
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock size={16} /> {item.duration}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart2 size={16} /> 評分:{' '}
                <span className="font-bold text-lg ml-1">{item.score}</span>
              </div>
              <span className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                查看詳情
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
