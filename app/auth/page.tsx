// app/auth/page.tsx
import { login, signup } from '@/app/auth/action';
import { Bot, Mail, Lock } from 'lucide-react';

export default function AuthPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Bot size={48} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Interview Pro
          </h1>
          <p className="text-gray-400">精進技能，成為頂尖工程師</p>
        </div>

        <div className="bg-gray-800 bg-opacity-75 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-2"
                  htmlFor="email"
                >
                  電子郵件
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-2"
                  htmlFor="password"
                >
                  密碼
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入密碼"
                    required
                  />
                </div>
              </div>
            </div>

            {searchParams?.message && (
              <p className="text-center text-sm text-green-400 p-2 bg-green-900/30 rounded-md">
                {searchParams.message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                formAction={login}
                className="flex-1 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 duration-300"
              >
                登入
              </button>
              <button
                formAction={signup}
                className="flex-1 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 duration-300"
              >
                註冊
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
