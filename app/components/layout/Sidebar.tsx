'use client';
import {
  BotMessageSquare,
  LayoutDashboard,
  MessageSquare,
  Code,
  History,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client'; // <-- 關鍵：引入前端 Client

const navItems = [
  { href: '/dashboard', label: '主控台', icon: LayoutDashboard },
  { href: '/practice/concept', label: '概念問答', icon: MessageSquare },
  { href: '/practice/code', label: '程式實作', icon: Code },
  { href: '/history', label: '練習紀錄', icon: History },
  // { href: '/settings', label: '設定', icon: Settings }, // 設定頁面尚未實作
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  // --- 新增：登出處理函式 ---
  const handleLogout = async () => {
    // 1. 建立一個前端專用的 Supabase client
    const supabase = createClient();

    // 2. 呼叫 signOut 方法
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('登出時發生錯誤:', error);
      alert('登出失敗，請稍後再試。');
    } else {
      // 3. 登出成功後，將使用者導向回登入頁面
      //    並重新整理以確保伺服器狀態更新
      router.push('/auth');
      router.refresh();
    }
  };
  // --- 結束新增 ---

  return (
    <nav className="hidden md:flex w-64 bg-[#111827] text-gray-300 flex-col p-4 border-r border-gray-700">
      <div className="flex items-center gap-3 mb-8">
        <BotMessageSquare size={32} className="text-blue-400" />
        <h1 className="text-xl font-bold">AI Interview Pro</h1>
      </div>
      <ul className="space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-blue-600/30 text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              <Icon size={20} /> {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        {' '}
        {/* <--- 新增：將登出按鈕推至底部 */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-400 hover:bg-red-900/50 hover:text-red-300"
        >
          <LogOut size={20} /> 登出
        </button>
      </div>
    </nav>
  );
}
