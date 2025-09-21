import { User } from 'lucide-react';

export default function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-4 flex-row-reverse">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center border border-gray-400">
        <User size={20} />
      </div>
      <p className="bg-blue-600 rounded-lg p-3">{content}</p>
    </div>
  );
}
