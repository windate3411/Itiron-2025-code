import { Bot, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Evaluation {
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
}

interface AiMessageProps {
  message: {
    content?: string;
    evaluation?: Evaluation;
  };
}

export default function AiMessage({ message }: AiMessageProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border border-blue-400">
        <Bot size={20} />
      </div>
      <div className="flex-1">
        {message.content && (
          <div
            className="bg-gray-700/80 rounded-lg p-3 text-gray-200"
            dangerouslySetInnerHTML={{
              __html: message.content.replace(
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
