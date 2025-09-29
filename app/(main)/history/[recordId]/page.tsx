import { mockPracticeDetail } from '@/app/lib/mockData';
import {
  ArrowLeft,
  Clock,
  BarChart2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import AiMessage from '@/app/components/interview/AIMessage';

export default function RecordDetailPage({
  params,
}: {
  params: { recordId: string };
}) {
  // 實際上，你會用 params.recordId 去 fetch 資料
  const detail = mockPracticeDetail;
  console.log('params', params);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href="/history"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={16} /> 返回練習紀錄
      </Link>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
        <h2 className="text-2xl font-bold">{detail.title}</h2>
        <div className="flex items-center gap-6 text-sm text-gray-400 mt-2">
          <span>{detail.date}</span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {detail.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart2 size={14} />
            最終評分:{' '}
            <strong className="text-lg text-white ml-1">{detail.score}</strong>
          </span>
        </div>
      </div>
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-4">你提交的程式碼</h3>
          <div className="bg-[#0d1117] rounded-xl border border-gray-700">
            <div className="p-2 border-b border-gray-700 bg-gray-900/50">
              <span className="text-sm text-gray-400">useDebounce.js</span>
            </div>
            <div className="p-4 overflow-auto">
              <pre className="text-sm">
                <code>{detail.submittedCode}</code>
              </pre>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">測試案例結果</h3>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-3">
            {detail.testResults.map((result) => (
              <div key={result.id} className="flex items-center gap-3">
                {result.passed ? (
                  <CheckCircle
                    size={20}
                    className="text-green-500 flex-shrink-0"
                  />
                ) : (
                  <XCircle size={20} className="text-red-500 flex-shrink-0" />
                )}
                <span className="text-sm">{result.description}</span>
              </div>
            ))}
          </div>
        </div>
        {detail.aiFeedback && (
          <div>
            <h3 className="text-xl font-bold mb-4">AI 回饋重點</h3>
            <AiMessage message={{ evaluation: detail.aiFeedback }} />
          </div>
        )}
      </div>
    </div>
  );
}
