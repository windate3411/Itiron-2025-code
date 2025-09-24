// scripts/seed-vector.js
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import questions from '../data/questions.json' with { type: "json" };


// 讓 node.js 腳本可以讀取 .env.local
dotenv.config({ path: './.env.local' });

async function seed() {
  
  // 1. 初始化客戶端
  const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // 2. 準備要上傳的資料 (以 hoisting 問題的第一個 keyPoint 為例)
  const firstQuestion = questions.find((q) => q.id === 'js-con-001');
  if (!firstQuestion || !firstQuestion.keyPoints.length) {
    console.error('找不到範例題目或 KeyPoint');
    return;
  }
  const keyPointToSeed = {
    questionId: firstQuestion.id,
    content: firstQuestion.keyPoints[0],
  };

  console.log(`準備處理 KeyPoint: "${keyPointToSeed.content}"`);

  try {
    // 3. 產生 Embedding
    console.log('正在產生 Embedding...');
    const response = await gemini.models.embedContent({
      model: 'gemini-embedding-001',
      contents: keyPointToSeed.content,
      config: {
        outputDimensionality: 768,
      },
    });

    const embedding = response.embeddings[0].values;

    console.log(`Embedding 產生成功，維度: ${embedding.length}`);

    // 4. 將資料寫入 Supabase
    console.log('正在寫入 Supabase...');
    const { data, error } = await supabase
      .from('documents')
      .insert({
        content: keyPointToSeed.content,
        embedding: embedding,
        question_id: keyPointToSeed.questionId,
      })
      .select(); // .select() 會將插入的資料回傳

    if (error) {
      throw new Error(`寫入 Supabase 失敗: ${error.message}`);
    }

    console.log('🎉 成功將第一筆向量資料寫入 Supabase！');
    console.log('寫入的資料:', data);
  } catch (error) {
    console.error('處理過程中發生錯誤:', error.message);
  }
}

seed();
