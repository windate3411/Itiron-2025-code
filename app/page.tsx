export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI 前端面試官 🤖
        </h1>

        <div className="max-w-2xl mx-auto">
          {/* 題目區 */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="text-sm text-blue-400 mb-2">題目 #1</div>
            <p className="text-lg">請解釋 JavaScript 中的 hoisting 是什麼？</p>
          </div>

          {/* 作答區 */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <textarea
              className="w-full h-32 bg-gray-700 rounded p-3 text-white"
              placeholder="在這裡輸入你的答案..."
            />
          </div>

          {/* 按鈕 */}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            提交答案
          </button>

          {/* AI 回饋區（暫時是空的） */}
          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <div className="text-sm text-green-400 mb-2">AI 回饋</div>
            <p className="text-gray-400 italic">
              提交答案後，AI 將在這裡提供回饋...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
