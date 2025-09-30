import { Bot, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState, useEffect } from 'react'; // 引入 React Hooks
interface Evaluation {
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
}

interface AIMessageProps {
  message: {
    content?: string;
    evaluation?: Evaluation;
  };
}

const TYPING_SPEED = 20; // 每個字元的延遲 (ms)，可以調整以獲得最佳體感

export default function AIMessage({ message }: AIMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    const targetContent = message.content || '';

    // 建立一個計時器
    const intervalId = setInterval(() => {
      setDisplayedContent((prev) => {
        if (prev.length === targetContent.length) {
          // 如果長度已經相等，表示動畫完成，清除計時器
          clearInterval(intervalId);
          return prev; // 返回原值，不觸發更新
        }
        // 返回 "當前內容" + "目標內容中的下一個字元"
        return targetContent.substring(0, prev.length + 1);
      });
    }, TYPING_SPEED);

    // 清理函式保持不變
    return () => clearInterval(intervalId);
  }, [message.content]);

  // 當 message.content 被清空或不存在時，同步重置 displayedContent
  useEffect(() => {
    if (!message.content) {
      setDisplayedContent('');
    }
  }, [message.content]);
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border border-blue-400">
        <Bot size={20} />
      </div>
      <div className="flex-1">
        {/* 【關鍵】將 message.content 改為使用 displayedContent state */}
        {displayedContent && (
          <div
            className="bg-gray-700/80 rounded-lg p-3 text-gray-200"
            dangerouslySetInnerHTML={{
              __html: displayedContent.replace(
                /\*\*(.*?)\*\*/g,
                '<strong>$1</strong>'
              ),
            }}
          />
        )}
        {message.evaluation && (
          <div className="bg-gray-700/50 rounded-lg p-4 mt-2 border border-gray-600">
            <h3 className="font-bold mb-3 text-lg text-green-400">
              AI 綜合評分
            </h3>
            <div className="flex items-center gap-2 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < Math.round(message.evaluation?.score || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-500'
                  }
                />
              ))}
              <span className="font-bold text-xl ml-2">
                {message.evaluation?.score || 0} / 5.0
              </span>
            </div>
            <p className="mb-4 italic">
              &quot;{message.evaluation?.summary || ''}&quot;
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-green-300 mb-2">
                  <ThumbsUp size={16} /> 優點分析
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {message.evaluation.pros.map((pro, i) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-orange-300 mb-2">
                  <ThumbsDown size={16} /> 改進建議
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {message.evaluation.cons.map((con, i) => (
                    <li key={i}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
