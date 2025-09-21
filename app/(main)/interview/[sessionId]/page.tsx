'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Question } from '@/app/types/question';
import CodingInterview from '@/app/components/interview/CodingInterview';
import ConceptualInterview from '@/app/components/interview/ConceptualInterview';
import { ChatMessage } from '@/app/types/interview';
export default function InterviewPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(true);
  const [answer, setAnswer] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsFetchingQuestion(true);
        const response = await fetch('/api/questions');
        const data: Question = await response.json();
        setCurrentQuestion(data);

        setChatHistory([
          { role: 'ai', content: '你好！我是你的 AI 前端面試官。' },
          { role: 'ai', content: `第一題：**${data.question}**` },
        ]);

        if (data.type === 'code' && data.starterCode) {
          setAnswer(data.starterCode);
        } else {
          setAnswer('');
        }
      } catch (error) {
        console.error('無法抓取題目:', error);
        setChatHistory([{ role: 'ai', content: '抱歉，載入題目時發生錯誤。' }]);
      } finally {
        setIsFetchingQuestion(false);
      }
    };
    fetchQuestion();
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!answer || !currentQuestion) return;

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: answer },
    ];
    setChatHistory(newHistory);
    const currentAnswer = answer;
    setAnswer('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: currentAnswer,
          keyPoints: currentQuestion.keyPoints,
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const aiResponse: ChatMessage = { role: 'ai', content: data.result };
      setChatHistory([...newHistory, aiResponse]);
    } catch (error) {
      console.error('錯誤:', error);
      const errorResponse: ChatMessage = {
        role: 'ai',
        content: '抱歉，我現在無法提供回饋，請稍後再試。',
      };
      setChatHistory([...newHistory, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingQuestion) {
    return <div className="p-8 text-center text-gray-400">正在載入面試...</div>;
  }

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center text-red-400">
        無法載入題目，請稍後再試。
      </div>
    );
  }

  return (
    <div className="h-full">
      {currentQuestion.type === 'code' ? (
        <CodingInterview
          sessionInfo={{
            currentQuestion: {
              title: currentQuestion.question,
              description: '',
            },
          }}
          code={answer}
          onCodeChange={setAnswer}
          chatHistory={chatHistory}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      ) : (
        <ConceptualInterview
          sessionInfo={{ title: currentQuestion.topic }}
          chatHistory={chatHistory}
          inputValue={answer}
          onInputChange={setAnswer}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
