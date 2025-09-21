import Editor from '@monaco-editor/react';
import AIMessage from './AIMessage';
import UserMessage from './UserMessage';
import { FileText, Bot, Terminal } from 'lucide-react';
import { ChatMessage } from '@/app/types/interview';
interface CodingInterviewProps {
  sessionInfo: {
    currentQuestion: { title: string; description: string };
  };
  code: string;
  onCodeChange: (value: string) => void;
  chatHistory: ChatMessage[];
  onSubmit: () => void;
  isLoading: boolean;
}

export default function CodingInterview({
  sessionInfo,
  code,
  onCodeChange,
  chatHistory,
  onSubmit,
  isLoading,
}: CodingInterviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full">
      {/* Left side: Question and Editor */}
      <div className="flex flex-col gap-4 h-full">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 flex-shrink-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-300 mb-2">
            <FileText size={20} />
            {sessionInfo.currentQuestion.title}
          </h2>
          <p className="text-gray-400 text-sm">
            {sessionInfo.currentQuestion.description}
          </p>
        </div>
        <div className="flex-1 flex flex-col bg-[#0d1117] rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex-shrink-0 p-2 border-b border-gray-700 bg-gray-900/50">
            <span className="text-sm text-gray-400">index.js</span>
          </div>
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => onCodeChange(value || '')}
            options={{ fontSize: 16, minimap: { enabled: false } }}
          />
        </div>
      </div>

      {/* Right side: AI Feedback and Controls */}
      <div className="flex flex-col bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden h-full">
        <header className="p-4 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Bot size={20} /> AI 回饋
          </h1>
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
          <div className="flex justify-end items-center gap-3">
            <button
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              disabled={isLoading}
            >
              <Terminal size={16} /> 測試
            </button>
            <button
              onClick={onSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              disabled={isLoading}
            >
              {isLoading ? '思考中...' : '提交答案'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
