'use client';

import { useState, useEffect, useRef } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);

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

    // 1. 立刻更新 UI，包含使用者的回答和一個 AI 的空回應框
    const userMessage: ChatMessage = { role: 'user', content: answer };
    const aiPlaceholderMessage: ChatMessage = { role: 'ai', content: '' };

    // 更新 chatHistory，讓 UI 即時反應
    setChatHistory((prevHistory) => [
      ...prevHistory,
      userMessage,
      aiPlaceholderMessage,
    ]);

    setAnswer(''); // 清空輸入框
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: answer,
          userId: 'anonymous-user',
          history: chatHistory, // 新增歷史對話紀錄
        }),
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      if (!response.body) {
        throw new Error('Response body is null');
      }

      // --- 串流處理邏輯 ---
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 串流結束，最後一次更新，並解析完整的 JSON
          try {
            const finalJson = JSON.parse(accumulatedResponse);
            // 使用 finalJson 中的 summary 作為最終顯示的 content
            setChatHistory((prevHistory) => {
              const newHistory = [...prevHistory];
              newHistory[newHistory.length - 1] = {
                role: 'ai',
                content: finalJson.summary || accumulatedResponse, // 降級使用原始文字
                evaluation: finalJson,
              };
              return newHistory;
            });
          } catch (e: unknown) {
            // 移除這裡的 AbortError 處理，因為 AbortError 會在最外層被捕獲
            console.error('無法解析最終的 JSON 字串:', accumulatedResponse);
            if (e instanceof Error) {
              console.error('錯誤訊息:', e.message);
            }
            // 如果解析失敗，至少保留原始文字流
            setChatHistory((prevHistory) => {
              const newHistory = [...prevHistory];
              newHistory[newHistory.length - 1].content =
                accumulatedResponse + '\n\n[AI 回應格式錯誤]';
              return newHistory;
            });
          } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
          }

          break;
        }

        // 持續解碼並更新最後一條 AI 訊息的 content
        accumulatedResponse += decoder.decode(value, { stream: true });
        setChatHistory((prevHistory) => {
          const newHistory = [...prevHistory];
          newHistory[newHistory.length - 1].content = accumulatedResponse;
          return newHistory;
        });
      }
    } catch (error) {
      // 檢查是否為手動取消
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Fetch request was aborted by the user.');
        setChatHistory((prevHistory) => {
          const newHistory = [...prevHistory];
          newHistory[newHistory.length - 1].content = '[已手動取消]';
          return newHistory;
        });
      } else {
        // 更新最後一條 AI 訊息為錯誤提示
        setChatHistory((prevHistory) => {
          const newHistory = [...prevHistory];
          newHistory[newHistory.length - 1].content =
            '抱歉，我現在無法提供回饋，請稍後再試。';
          return newHistory;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // 移除自定義訊息，讓它拋出標準的 AbortError
    }
    setIsLoading(false);
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
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
