import AIMessage from './AIMessage';
import UserMessage from './UserMessage';
import { ChevronRight } from 'lucide-react';
import { ChatMessage } from '@/app/types/interview';
interface ConceptualInterviewProps {
  chatHistory: ChatMessage[];
  sessionInfo: { title: string };
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ConceptualInterview({
  chatHistory,
  sessionInfo,
  inputValue,
  onInputChange,
  onSubmit,
  isLoading,
}: ConceptualInterviewProps) {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <header className="p-4 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold">{sessionInfo.title}</h1>
          <p className="text-sm text-gray-400">概念問答模式</p>
        </header>
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {chatHistory.map((msg, index) =>
            msg.role === 'ai' ? (
              <AIMessage key={index} message={msg} />
            ) : (
              <UserMessage key={index} content={msg.content} />
            )
          )}
        </div>
        <footer className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="在這裡輸入你的答案..."
              className="w-full h-24 bg-gray-700 rounded-lg p-3 pl-4 pr-12 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
            />
            <button
              onClick={onSubmit}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 disabled:text-gray-500"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
