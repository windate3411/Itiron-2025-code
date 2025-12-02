'use client';

import Link from 'next/link';
import { Bot } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 如果在 dashboard 或其他主要頁面，不顯示 Header
  const isDashboardRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/practice') ||
    pathname?.startsWith('/history') ||
    pathname?.startsWith('/interview');

  useEffect(() => {
    const supabase = createClient();

    // 取得當前使用者
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isDashboardRoute) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo 和名稱 */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Bot size={32} className="text-blue-400" />
            <span className="text-xl font-bold text-white">
              AI Interview Pro
            </span>
          </Link>

          {/* 導航按鈕 */}
          <div className="flex items-center gap-4">
            {pathname === '/auth' ? (
              <Link
                href="/"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                回首頁
              </Link>
            ) : (
              <>
                {!loading &&
                  (user ? (
                    // 已登入：只顯示進入主控台
                    <Link
                      href="/dashboard"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      進入主控台
                    </Link>
                  ) : (
                    // 未登入：顯示登入按鈕（使用相同樣式）
                    <Link
                      href="/auth"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      登入
                    </Link>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
