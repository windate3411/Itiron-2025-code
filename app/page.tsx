'use client'; // 重要！告訴 Next.js 這是客戶端元件, 這樣才能使用 client-side 的 hooks

import { useState, useEffect } from 'react';
import { Question } from './types/question';

export default function Home() {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsFetchingQuestion(true);
        const response = await fetch('/api/questions');
        const data = await response.json();
        setCurrentQuestion(data);
      } catch (error) {
        console.error('無法抓取題目:', error);
      } finally {
        setIsFetchingQuestion(false);
      }
    };
    fetchQuestion();
  }, []);

  const handleSubmit = async () => {
    if (!answer) return;
    try {
      setIsLoading(true);

      // 發送請求到我們剛剛在後端app/api/gemini/route.ts建立的API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        body: JSON.stringify({
          question: currentQuestion?.question,
          answer,
        }),
      });
      const data = await response.json();

      setFeedback(data.result);
    } catch (error) {
      console.error('錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI 前端面試官 🤖
        </h1>

        <div className="max-w-2xl mx-auto">
          {/* 題目區 */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            {isFetchingQuestion ? (
              <p className="text-center text-gray-400">正在從題庫抽取題目...</p>
            ) : (
              currentQuestion && (
                <>
                  <div className="text-sm text-blue-400 mb-2">
                    {currentQuestion.topic} 題目
                  </div>
                  <p className="text-lg">{currentQuestion.question}</p>
                </>
              )
            )}
          </div>

          {/* 作答區 */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full h-32 bg-gray-700 rounded p-3 text-white"
              placeholder="在這裡輸入你的答案..."
              disabled={isLoading}
            />
          </div>

          {/* 按鈕 */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !answer}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? '🤔 AI 思考中...' : '提交答案'}
          </button>

          {/* AI 回饋區 */}
          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <div className="text-sm text-green-400 mb-2">AI 回饋</div>

            {feedback ? (
              <div className="text-gray-300 whitespace-pre-wrap">
                {feedback}
              </div>
            ) : (
              <p className="text-gray-400 italic">
                提交答案後，AI 將在這裡提供回饋...
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
