'use client';
import {
  BarChart2,
  History,
  Zap,
  Target,
  MessageSquare,
  Code,
} from 'lucide-react';
import {
  mockDashboardStats,
  mockTopicProgress,
  mockPracticeHistory,
} from '@/app/lib/mockData';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-2">歡迎回來，Danny！</h2>
      <p className="text-gray-400 mb-8">
        今天也是精進自己，成為頂尖工程師的一天！
      </p>

      {/* 統計數據 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
          <BarChart2 className="text-green-400" size={32} />
          <div>
            <p className="text-3xl font-bold">
              {mockDashboardStats.averageScore}%
            </p>
            <p className="text-sm text-gray-400">平均得分</p>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
          <History className="text-blue-400" size={32} />
          <div>
            <p className="text-3xl font-bold">
              {mockDashboardStats.totalSessions}
            </p>
            <p className="text-sm text-gray-400">總練習次數</p>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
          <Zap className="text-yellow-400" size={32} />
          <div>
            <p className="text-3xl font-bold">{mockDashboardStats.streak} 天</p>
            <p className="text-sm text-gray-400">連續練習</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* 開始練習 */}
          <div>
            <h3 className="text-xl font-bold mb-4">開始新的練習</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/practice/conceptual"
                className="bg-gray-800 p-6 rounded-lg text-left hover:ring-2 ring-blue-500 transition"
              >
                <MessageSquare className="text-blue-400 mb-3" size={28} />{' '}
                <h3 className="text-lg font-semibold mb-1">概念問答</h3>{' '}
                <p className="text-sm text-gray-400">
                  測試你對前端技術的理解深度
                </p>
              </Link>
              <Link
                href="/practice/coding"
                className="bg-gray-800 p-6 rounded-lg text-left hover:ring-2 ring-purple-500 transition"
              >
                <Code className="text-purple-400 mb-3" size={28} />{' '}
                <h3 className="text-lg font-semibold mb-1">程式實作</h3>{' '}
                <p className="text-sm text-gray-400">實際撰寫程式碼解決問題</p>
              </Link>
            </div>
          </div>
          {/* 最近練習 */}
          <div>
            <h3 className="text-xl font-bold mb-4">最近的練習</h3>
            <div className="space-y-4">
              {mockPracticeHistory.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {item.type === '程式實作' ? (
                      <Code className="text-purple-400" />
                    ) : (
                      <MessageSquare className="text-blue-400" />
                    )}
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{item.score}</p>
                    <p className="text-sm text-gray-400">得分</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 學習進度 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Target size={22} /> 學習進度
          </h3>
          <div className="space-y-5">
            {mockTopicProgress.map((item) => (
              <div key={item.topic}>
                <div className="flex justify-between items-end mb-1">
                  <h4 className={`font-semibold text-sm ${item.color}`}>
                    {item.topic}
                  </h4>
                  <p className="text-sm font-mono text-gray-300">
                    {item.progress}%
                  </p>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r from-gray-400 to-current ${item.color} h-2 rounded-full`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
