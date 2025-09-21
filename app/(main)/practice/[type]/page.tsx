'use client';
import { mockConceptualTopics, mockCodingTopics } from '@/app/lib/mockData';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TopicSelectionPage() {
  const params = useParams();
  const type = params.type as 'concept' | 'code';

  const isConceptual = type === 'concept';
  const title = isConceptual ? '概念問答' : '程式實作';
  const topics = isConceptual ? mockConceptualTopics : mockCodingTopics;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-gray-400 mb-8">選擇一個主題開始你的練習</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className={`p-6 rounded-lg flex flex-col ${topic.bgColor} border border-gray-700`}
          >
            <h3 className={`text-xl font-bold mb-2 ${topic.color}`}>
              {topic.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 flex-1">
              {topic.description}
            </p>
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1">
                <h4 className={`font-semibold text-xs text-gray-300`}>
                  掌握度
                </h4>
                <p className="text-sm font-mono text-gray-300">
                  {topic.progress}%
                </p>
              </div>
              <div className="w-full bg-gray-600/50 rounded-full h-2">
                <div
                  className={`${topic.color.replace(
                    'text',
                    'bg'
                  )} h-2 rounded-full`}
                  style={{ width: `${topic.progress}%` }}
                ></div>
              </div>
            </div>
            <Link
              href={`/interview/${topic.id}`}
              className={`w-full text-center mt-auto bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors`}
            >
              開始練習
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
