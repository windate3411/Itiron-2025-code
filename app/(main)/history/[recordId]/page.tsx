// app/history/[recordId]/page.tsx
import { createAuthClient } from '@/app/lib/supabase/server';
import { notFound } from 'next/navigation';
import questions from '@/data/questions.json';
import AiMessage from '@/app/components/interview/AIMessage';
import Link from 'next/link';
import { ArrowLeft, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import { Evaluation } from '@/app/types/interview';
type PageProps = {
  params: { recordId: string };
};

export default async function RecordDetailPage({ params }: PageProps) {
  const { recordId } = await params;
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // 【核心修改】根據 recordId 抓取單筆資料，並驗證 user_id
  const { data: record, error } = await supabase
    .from('practice_records')
    .select('*')
    .eq('id', recordId)
    .eq('user_id', user.id) // 確保只能抓到自己的紀錄
    .single(); // .single() 期望只回傳一筆資料，否則會報錯

  // 如果查詢出錯或找不到紀錄，顯示 404 頁面
  if (error || !record) {
    notFound();
  }

  const questionInfo = questions.find((q) => q.id === record.question_id);
  const evaluation = record.evaluation as Evaluation & {
    grounded_evidence: {
      tests_passed: number;
      tests_failed: number;
      stderr_excerpt: string;
    };
  };
  const groundedEvidence = evaluation?.grounded_evidence;
  const formattedDate = new Date(record.created_at).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* UI 結構完全沿用你的設計 */}
      <Link
        href="/history"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={16} /> 返回練習紀錄
      </Link>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
        <h2 className="text-2xl font-bold">
          {questionInfo?.question || '未知題目'}
        </h2>
        <div className="flex items-center gap-6 text-sm text-gray-400 mt-2">
          <span>{formattedDate}</span>
          {/* 練習時長 (duration) 目前未儲存，暫時移除 */}
          <span className="flex items-center gap-1.5">
            <BarChart2 size={14} />
            最終評分:{' '}
            <strong className="text-lg text-white ml-1">{record.score}</strong>
          </span>
        </div>
      </div>
      <div className="space-y-8">
        {record.user_answer && (
          <div>
            <h3 className="text-xl font-bold mb-4">你提交的答案</h3>
            <div className="bg-[#0d1117] rounded-xl border border-gray-700">
              {/* 檔名是 mock data 才有的，真實答案不一定有檔名，故移除 */}
              <div className="p-4 overflow-auto">
                <pre className="text-sm">
                  <code>{record.user_answer}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 【修改】測試案例結果，從 evaluation.grounded_evidence 取得 */}
        {groundedEvidence && (
          <div>
            <h3 className="text-xl font-bold mb-4">測試案例結果</h3>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-3">
              {groundedEvidence.tests_passed > 0 && (
                <div className="flex items-center gap-3">
                  <CheckCircle
                    size={20}
                    className="text-green-500 flex-shrink-0"
                  />
                  <span className="text-sm">
                    {groundedEvidence.tests_passed} 個測試案例通過
                  </span>
                </div>
              )}
              {groundedEvidence.tests_failed > 0 && (
                <div className="flex items-center gap-3">
                  <XCircle size={20} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm">
                    {groundedEvidence.tests_failed} 個測試案例失敗
                  </span>
                </div>
              )}
              {groundedEvidence.stderr_excerpt && (
                <div className="text-sm text-red-400 mt-2">
                  <p className="font-semibold">錯誤摘要:</p>
                  <pre className="bg-black/20 p-2 rounded-md mt-1 whitespace-pre-wrap">
                    {groundedEvidence.stderr_excerpt}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI 回饋直接傳入 evaluation 物件，與 AIMessage 元件無縫接軌 */}
        {evaluation && (
          <div>
            <h3 className="text-xl font-bold mb-4">AI 回饋重點</h3>
            <AiMessage message={{ evaluation: evaluation }} />
          </div>
        )}
      </div>
    </div>
  );
}
