import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

async function testSearch() {
  // 1. 模擬使用者回答 hoisting 問題
  const userAnswer = '變數宣告會被拉到程式碼最上面，但賦值會留在原地';
  const targetQuestionId = 'js-con-001'; // 我們要針對 hoisting 問題進行搜尋

  console.log(`[測試] 使用者回答: "${userAnswer}"`);
  console.log(`[測試] 搜尋目標問題 ID: ${targetQuestionId}`);

  // 2. 初始化客戶端
  const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // 3. 將使用者回答轉換成查詢向量
    console.log('[測試] 正在產生查詢向量...');
    const response = await gemini.models.embedContent({
      model: 'gemini-embedding-001',
      contents: [userAnswer],
      config: { outputDimensionality: 768 },
    });
    const queryEmbedding = response.embeddings[0].values;
    console.log(`[測試] 查詢向量產生成功 (維度: ${queryEmbedding.length})`);

    // 4. 呼叫資料庫函式進行搜尋！
    console.log('[測試] 正在呼叫 Supabase 資料庫函式 "match_documents"...');
    // 使用我們剛建立的 match_documents 函式
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding, // 傳入我們的查詢向量
      p_question_id: targetQuestionId, // 【關鍵】傳入我們要搜尋的問題 ID
      match_threshold: 0.7, // 設定一個合理的相似度門檻
      match_count: 5, // 最多找 5 筆
    });

    if (error) {
      throw new Error(`RPC 呼叫失敗: ${error.message}`);
    }

    console.log('✅ 成功從資料庫中檢索到以下相關資料：');
    if (data && data.length > 0) {
      console.table(data);
    } else {
      console.log('找不到任何相關資料，可以試著調低 match_threshold 看看。');
    }
  } catch (error) {
    console.error('測試過程中發生錯誤:', error.message);
  }
}

testSearch();
