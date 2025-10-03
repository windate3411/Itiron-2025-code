const mockDashboardStats = {
  totalSessions: 12,
  averageScore: 85,
  streak: 3,
};

const mockTopicProgress = [
  { topic: 'JavaScript (ES6+)', progress: 75, color: 'text-yellow-400' },
  { topic: 'React', progress: 85, color: 'text-blue-400' },
  { topic: 'TypeScript', progress: 60, color: 'text-cyan-400' },
  { topic: 'CSS & 版面設計', progress: 70, color: 'text-pink-400' },
  { topic: 'Web 效能', progress: 45, color: 'text-green-400' },
];

const mockConceptualTopics = [
  {
    id: 'javascript-concept',
    title: 'JavaScript 核心觀念',
    description: '深入探討 Hoisting, Closure, Prototype 等基礎。',
    progress: 75,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    ringColor: 'ring-yellow-500',
  },
  {
    id: 'react-concept',
    title: 'React 基礎與 Hooks',
    description: '從元件生命週期到 state 與 effect 的掌握。',
    progress: 85,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    ringColor: 'ring-blue-500',
  },
  {
    id: 'typescript-concept',
    title: 'TypeScript 基礎',
    description: '理解型別、泛型與 Interface 的應用。',
    progress: 60,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/20',
    ringColor: 'ring-cyan-500',
  },
  {
    id: 'javascript-concept',
    title: '網路請求與非同步',
    description: '關於 Fetch, Promise 與 async/await 的一切。',
    progress: 55,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-900/20',
    ringColor: 'ring-indigo-500',
  },
];

const mockCodingTopics = [
  {
    id: 'css-code',
    title: 'CSS 版面挑戰',
    description: '使用 Flexbox 與 Grid 打造複雜響應式版面。',
    progress: 70,
    color: 'text-pink-400',
    bgColor: 'bg-pink-900/20',
    ringColor: 'ring-pink-500',
  },
  {
    id: 'javascript-code',
    title: '實作 React Hooks',
    description: '從零開始打造 useDebounce, useToggle 等工具。',
    progress: 85,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    ringColor: 'ring-blue-500',
  },
  {
    id: 'javascript-code',
    title: '演算法入門',
    description: '常見的字串與陣列操作題目。',
    progress: 65,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    ringColor: 'ring-green-500',
  },
];

const mockInterviewSession = {
  title: 'React Hooks 深度剖析',
  questionNumber: 3,
  currentQuestion: {
    type: '程式題',
    title: '實作一個自定義 Hook: `useDebounce`',
    description:
      '請你實作一個名為 `useDebounce` 的自定義 React Hook。這個 Hook 接收兩個參數：一個是需要被防抖的值（value），另一個是延遲時間（delay）。它應該在 value 停止變化 delay 毫秒後，才回傳最新的 value。',
    templateCode: `import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  // 請在這裡實作你的 debounce 邏輯
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// --- 範例使用 ---
export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // ... 接下來的 UI 會使用 debouncedSearchTerm ...
}`,
  },
};

const mockChatHistory = [
  {
    role: 'ai',
    content:
      '你好！我是你的 AI 前端面試官。準備好後，我們就開始今天的 React Hooks 主題面試。',
  },
  { role: 'user', content: '我準備好了，請出題吧！' },
  {
    role: 'ai',
    content:
      '好的，第一題：**請解釋在 React 中，`useEffect` 的第二個參數（依賴陣列）有哪些常見的用法和情境？**',
  },
  {
    role: 'user',
    content:
      '`useEffect` 的依賴陣列主要有三種情境：1. 不傳遞：每次 re-render 都會執行。 2. 傳遞空陣列 `[]`：只在元件首次掛載時執行，類似 `componentDidMount`。 3. 傳遞包含變數的陣列 `[dep1, dep2]`：當陣列中的任何一個變數發生變化時，effect 就會重新執行。',
  },
  {
    role: 'ai',
    evaluation: {
      score: 4.5,
      summary: '回答得非常出色！核心概念都掌握了。',
      pros: [
        '清楚地分點說明了三種主要情境。',
        '提到了與 Class Component 生命週期的類比，有助於理解。',
      ],
      cons: [
        '可以補充說明省略依賴陣列可能導致的無限循環風險。',
        '若能提到 `return` 一個清理函式 (cleanup function) 會更完整。',
      ],
    },
  },
  {
    role: 'ai',
    content: `非常好！觀念很清晰。那我們接著進行下一題程式實作題：**${mockInterviewSession.currentQuestion.title}**。請在右側的編輯器中完成它。`,
  },
];

const mockPracticeHistory = [
  {
    id: 1,
    title: 'React Hooks 深度剖析',
    type: '程式實作',
    date: '2025-09-14',
    score: 88,
    duration: '45 分鐘',
  },
  {
    id: 2,
    title: 'JavaScript 核心觀念',
    type: '概念問答',
    date: '2025-09-12',
    score: 92,
    duration: '25 分鐘',
  },
  {
    id: 3,
    title: 'CSS Flexbox & Grid',
    type: '程式實作',
    date: '2025-09-10',
    score: 75,
    duration: '55 分鐘',
  },
  {
    id: 4,
    title: '非同步 JavaScript (Async/Await)',
    type: '概念問答',
    date: '2025-09-09',
    score: 82,
    duration: '30 分鐘',
  },
];

const mockPracticeDetail = {
  ...mockPracticeHistory[0],
  submittedCode: mockInterviewSession.currentQuestion.templateCode,
  testResults: [
    { id: 1, description: '500ms 後應回傳最新值', passed: true },
    { id: 2, description: '值快速變化時不應觸發更新', passed: true },
    { id: 3, description: 'delay 參數應能動態改變', passed: true },
    { id: 4, description: '應處理初始值', passed: true },
  ],
  chatHistory: mockChatHistory,
  aiFeedback: {
    score: 4.5,
    summary: '回答得非常出色！核心概念都掌握了。',
    pros: [
      '清楚地分點說明了三種主要情境。',
      '提到了與 Class Component 生命週期的類比，有助於理解。',
    ],
    cons: [
      '可以補充說明省略依賴陣列可能導致的無限循環風險。',
      '若能提到 `return` 一個清理函式 (cleanup function) 會更完整。',
    ],
  },
};

export {
  mockDashboardStats,
  mockTopicProgress,
  mockConceptualTopics,
  mockCodingTopics,
  mockInterviewSession,
  mockChatHistory,
  mockPracticeHistory,
  mockPracticeDetail,
};
