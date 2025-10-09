import { Code, MessageSquare, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { createAuthClient } from '@/app/lib/supabase/server';
import questions from '@/data/questions.json';

export default async function PracticeHistoryPage() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="p-8">Please log in to view your history.</p>;
  }

  const { data: records, error } = await supabase
    .from('practice_records')
    .select('id, created_at, question_id, score')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching records:', error);
    return (
      <p className="p-8">
        Sorry, something went wrong while fetching your records.
      </p>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">練習紀錄</h2>
      <div className="space-y-4">
        {records.length === 0 ? (
          <p>
            還沒有任何練習紀錄，
            <Link href="/" className="text-blue-400 hover:underline">
              現在就開始吧！
            </Link>
          </p>
        ) : (
          records.map((item) => {
            const questionInfo = questions.find(
              (q) => q.id === item.question_id
            );
            const title = questionInfo
              ? `${questionInfo.type}: ${questionInfo.question}`
              : '未知題目';
            const type = questionInfo ? questionInfo.type : '概念問答';

            const formattedDate = new Date(item.created_at).toLocaleString(
              'zh-TW',
              {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }
            );

            return (
              <Link
                href={`/history/${item.id}`}
                key={item.id}
                className="bg-gray-800 p-4 rounded-lg flex items-center justify-between hover:bg-gray-700/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {type === '程式實作' ? (
                    <Code className="text-purple-400" />
                  ) : (
                    <MessageSquare className="text-blue-400" />
                  )}
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-gray-400">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {/* 注意：duration 目前資料庫沒有，暫時移除 */}
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart2 size={16} /> 評分:{' '}
                    <span className="font-bold text-lg ml-1">{item.score}</span>
                  </div>
                  <span className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                    查看詳情
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
