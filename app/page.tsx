'use client';

import Link from 'next/link';
import Header from './components/layout/Header';
import ScrollProgress from './components/layout/ScrollProgress';
import { useScrollAnimation } from './hooks/useScrollAnimation';
import { useEffect, useState } from 'react';
import { createClient } from './lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import {
  Bot,
  Code,
  MessageSquare,
  BarChart2,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Check
} from 'lucide-react';

// 使用者回饋資料
const testimonials = [
  {
    name: '李小明',
    role: '前端工程師 @ 國泰金控',
    avatar: '👨‍💻',
    content: '使用 AI Interview Pro 練習了兩個月，成功拿到夢想公司的 offer！AI 的回饋非常專業且具體。',
    rating: 5,
  },
  {
    name: '王美華',
    role: '資深前端工程師 @ 台積電',
    avatar: '👩‍💻',
    content: '這個平台讓我在轉職過程中更有信心。程式實作的題目很貼近真實面試，幫助我發現了很多盲點。',
    rating: 5,
  },
  {
    name: '張志偉',
    role: 'Full Stack Developer @ 新創公司',
    avatar: '👨‍🎓',
    content: '隨時隨地都能練習，不用擔心打擾真人面試官。AI 的評分標準也很客觀，讓我知道該往哪個方向努力。',
    rating: 5,
  },
];

// 費用方案
const pricingPlans = [
  {
    name: '免費體驗',
    price: 0,
    period: '永久免費',
    features: [
      '每日 5 次練習機會',
      '基礎題庫存取',
      'AI 基本回饋',
      '7 天歷史記錄',
    ],
    highlight: false,
  },
  {
    name: '專業版',
    price: 299,
    period: '每月',
    features: [
      '無限次練習',
      '完整題庫存取',
      'AI 深度分析回饋',
      '無限歷史記錄',
      '進度追蹤儀表板',
      '程式碼執行環境',
    ],
    highlight: true,
  },
  {
    name: '企業版',
    price: 999,
    period: '每月',
    features: [
      '專業版所有功能',
      '客製化題庫',
      '團隊管理功能',
      '詳細分析報告',
      '優先技術支援',
      'API 整合服務',
    ],
    highlight: false,
  },
];

// 動畫卡片組件
function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 取得當前使用者
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <ScrollProgress />
      <Header />

      {/* Hero Section */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Bot size={80} className="text-blue-400 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AI Interview Pro
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              用 AI 技術，精準模擬真實前端面試
            </p>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              從概念問答到程式實作，讓 AI 面試官協助你成為頂尖工程師
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!loading && (
                user ? (
                  // 已登入：只顯示進入主控台
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    進入主控台 <ArrowRight size={20} />
                  </Link>
                ) : (
                  // 未登入：顯示開始練習和進入主控台兩個按鈕
                  <>
                    <Link
                      href="/auth"
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                      開始練習 <ArrowRight size={20} />
                    </Link>
                    <Link
                      href="/dashboard"
                      className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                      進入主控台
                    </Link>
                  </>
                )
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <AnimatedCard delay={0}>
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-all h-full">
                <MessageSquare className="text-blue-400 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-3">概念問答</h3>
                <p className="text-gray-400">
                  深入測試你對前端技術的理解，包括 JavaScript、React、CSS 等核心概念
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200}>
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all h-full">
                <Code className="text-purple-400 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-3">程式實作</h3>
                <p className="text-gray-400">
                  在真實的編輯器環境中撰寫程式碼，即時執行並獲得 AI 的專業回饋
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={400}>
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-green-500 transition-all h-full">
                <BarChart2 className="text-green-400 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-3">進度追蹤</h3>
                <p className="text-gray-400">
                  詳細的數據分析，追蹤你的學習進度，找出需要加強的領域
                </p>
              </div>
            </AnimatedCard>
          </div>

          {/* Benefits Section */}
          <AnimatedCard>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-700 mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">為什麼選擇 AI Interview Pro?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatedCard delay={0}>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="text-blue-400 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold mb-2">24/7 隨時練習</h4>
                      <p className="text-gray-400">不受時間限制，隨時隨地開始你的面試練習</p>
                    </div>
                  </div>
                </AnimatedCard>
                <AnimatedCard delay={200}>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="text-purple-400 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold mb-2">即時 AI 回饋</h4>
                      <p className="text-gray-400">獲得專業、詳細的評估和改進建議</p>
                    </div>
                  </div>
                </AnimatedCard>
                <AnimatedCard delay={400}>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="text-green-400 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold mb-2">真實面試情境</h4>
                      <p className="text-gray-400">模擬真實的面試流程和問題難度</p>
                    </div>
                  </div>
                </AnimatedCard>
                <AnimatedCard delay={600}>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold mb-2">持續進步追蹤</h4>
                      <p className="text-gray-400">量化你的進步，看見自己的成長軌跡</p>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </AnimatedCard>

          {/* Testimonials Section */}
          <AnimatedCard>
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-4 text-center">使用者真實回饋</h2>
              <p className="text-gray-400 text-center mb-12 text-lg">
                看看其他工程師如何透過 AI Interview Pro 達成目標
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <AnimatedCard key={index} delay={index * 200}>
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">{testimonial.avatar}</div>
                        <div>
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-sm text-gray-400">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {testimonial.content}
                      </p>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          </AnimatedCard>

          {/* Pricing Section */}
          <AnimatedCard>
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-4 text-center">選擇最適合你的方案</h2>
              <p className="text-gray-400 text-center mb-12 text-lg">
                從免費體驗開始，隨時升級到專業版或企業版
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPlans.map((plan, index) => (
                  <AnimatedCard key={index} delay={index * 200}>
                    <div
                      className={`bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border transition-all h-full flex flex-col ${
                        plan.highlight
                          ? 'border-blue-500 ring-2 ring-blue-500 scale-105'
                          : 'border-gray-700 hover:border-blue-500'
                      }`}
                    >
                      {plan.highlight && (
                        <div className="text-center mb-4">
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            最受歡迎
                          </span>
                        </div>
                      )}
                      <h3 className="text-2xl font-bold mb-2 text-center">{plan.name}</h3>
                      <div className="text-center mb-6">
                        <span className="text-4xl font-bold">
                          {plan.price === 0 ? '免費' : `NT$ ${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-400 text-sm ml-2">/ {plan.period}</span>
                        )}
                        {plan.price === 0 && (
                          <div className="text-gray-400 text-sm mt-1">{plan.period}</div>
                        )}
                      </div>
                      <ul className="space-y-3 mb-8 flex-grow">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/auth"
                        className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                          plan.highlight
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                      >
                        {plan.price === 0 ? '立即體驗' : '開始使用'}
                      </Link>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          </AnimatedCard>

          {/* CTA Section */}
          <AnimatedCard>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">準備好開始了嗎？</h2>
              <p className="text-gray-400 mb-8 text-lg">
                立即註冊，開始你的前端工程師進階之旅
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-xl text-lg"
              >
                <Zap size={24} />
                免費開始練習
              </Link>
            </div>
          </AnimatedCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl text-center text-gray-400">
          <p>&copy; 2025 AI Interview Pro. 精進技能，成為頂尖工程師。</p>
        </div>
      </footer>
    </div>
  );
}
