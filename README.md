# AI Interview Pro

一個基於 AI 技術的前端面試練習平台，提供概念問答和程式實作兩種面試模式，讓工程師能夠隨時隨地進行面試練習並獲得專業的 AI 回饋。

## ✨ 功能特色

### 🎯 雙模式面試練習

- **概念問答**：測試對前端技術的理解，包括 JavaScript、React、CSS 等核心概念
- **程式實作**：在真實的編輯器環境中撰寫程式碼，即時執行並獲得 AI 的專業回饋

### 🤖 AI 驅動的智能評估

- 使用 Google Gemini 2.5 Flash 模型進行智能評估
- 針對概念題目使用 RAG (Retrieval-Augmented Generation) 技術，基於向量搜尋提供準確的知識點參考
- 針對程式題目整合 Judge0 API，實際執行程式碼並分析執行結果
- 提供結構化的評分、優缺點分析和改進建議

### 📊 進度追蹤與歷史記錄

- 個人化儀表板，追蹤練習進度和統計數據
- 完整的練習歷史記錄，可隨時回顧過去的面試表現
- 主題分類的掌握度追蹤

## 🛠 技術棧

### 前端

- **Next.js 15.5.2** - React 框架，使用 App Router
- **React 19** - UI 函式庫
- **TypeScript** - 型別安全
- **Tailwind CSS 4** - 樣式框架
- **Monaco Editor** - 程式碼編輯器
- **Lucide React** - 圖示庫

### 後端與服務

- **Supabase** - 認證與資料庫
  - 使用者認證
  - PostgreSQL 資料庫
  - 向量搜尋 (pgvector) 用於 RAG
- **Google Gemini AI** - AI 模型服務
  - Gemini 2.5 Flash - 對話與評估
  - Gemini Embedding 001 - 向量生成
- **Judge0 API** - 程式碼執行服務

## Demo URL

[https://itiron-2025-code.vercel.app/](https://itiron-2025-code.vercel.app/)

> 在本地執行專案需要一些環境的設定，有些過於麻煩，建議直接使用 Demo URL 進行測試。
