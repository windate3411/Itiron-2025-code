'use client';
import {
  BotMessageSquare,
  LayoutDashboard,
  MessageSquare,
  Code,
  History,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: '主控台', icon: LayoutDashboard },
  { href: '/practice/concept', label: '概念問答', icon: MessageSquare },
  { href: '/practice/code', label: '程式實作', icon: Code },
  { href: '/history', label: '練習紀錄', icon: History },
  // { href: '/settings', label: '設定', icon: Settings }, // 設定頁面尚未實作
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

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
    </nav>
  );
}
