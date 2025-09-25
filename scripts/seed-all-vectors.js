import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import questions from '../data/questions.json' with { type: "json" };


dotenv.config({ path: './.env.local' });

// 輔助函數：將陣列分割成指定大小的區塊
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function seedAll() {
  // 初始化客戶端 (使用 Day 10 設定好的環境變數)
  const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('正在清空舊的 documents 資料...');
  const { error: deleteError } = await supabase.from('documents').delete().neq('id', 0);
  if (deleteError) {
    console.error('清空資料失敗:', deleteError.message);
    return;
  }
  console.log('舊資料已清空。');

  console.log('開始處理所有 questions.json 中的 keyPoints...');

  // 1. 將所有 keyPoints 攤平成一個列表
  const allKeyPoints = questions.flatMap(q => {
    // 只處理有 keyPoints 且其為陣列的題目
    if (q.keyPoints && Array.isArray(q.keyPoints)) {
      return q.keyPoints.map(kp => ({
        questionId: q.id,
        content: kp,
      }));
    }
    // 如果沒有 keyPoints，就回傳空陣列，flatMap 會自動忽略它
    return [];
  });

  console.log(`總共找到 ${allKeyPoints.length} 個 keyPoints 待處理。`);

  // 2. 將資料分塊，避免一次送出太多請求
  const chunks = chunkArray(allKeyPoints, 5); // 一次處理 5 筆

  try {
    for (const [index, chunk] of chunks.entries()) {
      console.log(`- 正在處理第 ${index + 1} / ${chunks.length} 批資料...`);

      const contents = chunk.map(kp => kp.content);

      // 3. 一次性產生多個 Embedding
      const response = await gemini.models.embedContent({
        model: 'gemini-embedding-001',
        contents: contents,
        config: { outputDimensionality: 768 },
      });
      const embeddings = response.embeddings.map(e => e.values);

      // 4. 準備要插入的資料
      const dataToInsert = chunk.map((kp, i) => ({
        content: kp.content,
        embedding: embeddings[i],
        question_id: kp.questionId,
      }));

      // 5. 一次性插入多筆資料
      const { error } = await supabase.from('documents').insert(dataToInsert);

      if (error) {
        console.error(`  寫入此批資料失敗: ${error.message}`);
      } else {
        console.log(`  成功寫入 ${chunk.length} 筆資料。`);
      }
    }

    console.log('🎉 所有 KeyPoints 已成功寫入 Supabase！');

  } catch (error) {
    console.error('批量處理過程中發生嚴重錯誤:', error.message);
  }
}

seedAll();