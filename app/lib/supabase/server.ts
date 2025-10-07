import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 初始化 Supabase client，確保只在伺服器端使用 service key
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * 執行 RAG 語意搜尋。
 * @param embedding 使用者回答的向量
 * @param questionId 目標問題 ID
 * @returns 相關的知識點內容
 */
export async function performRagSearch(
  embedding: number[],
  questionId: string
): Promise<string> {
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5,
    p_question_id: questionId,
  });

  if (error) {
    console.error('Supabase RAG search error:', error);
    // 在發生錯誤時回傳一個友善的訊息，而不是讓整個請求失敗
    return '知識庫查詢失敗，請稍後再試。';
  }

  return data?.length > 0
    ? data.map((d: { content: string }) => `- ${d.content}`).join('\n')
    : '在知識庫中找不到相關的參考資料。';
}

// 創建一個用於認證的 Supabase client
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
