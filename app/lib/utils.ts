import { ChatMessage } from '@/app/types/interview';

/**
 * 通用的非同步函式重試機制，具備指數退避策略。
 * @param asyncFn 要執行的非同步函式
 * @param retries 重試次數，預設 3 次
 * @param delay 初始延遲時間 (ms)，預設 1000ms
 * @param onRetry 每次重試時呼叫的回呼函式
 * @returns 非同步函式的執行結果
 */
export async function retryAsyncFunction<T>(
  asyncFn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  onRetry?: (error: Error, attempt: number) => void
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await asyncFn();
    } catch (error) {
      if (onRetry) {
        onRetry(error as Error, i + 1);
      }
      if (i === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
    }
  }
  // 迴圈結束後還是失敗，拋出錯誤 (理論上不會執行到這裡，但為求型別安全)
  throw new Error('Retry failed after multiple attempts.');
}

/**
 * 將對話歷史格式化為純文字，並只取最近的訊息。
 * @param history 聊天訊息陣列
 * @returns 格式化後的純文字歷史紀錄
 */
export function formatChatHistory(history: ChatMessage[]): string {
  if (!history || history.length === 0) {
    return '無歷史對話紀錄。';
  }
  // 只取最近的 4 則訊息 (約 2 輪對話)，避免 Prompt 過長
  const recentHistory = history.slice(-4);
  return recentHistory
    .map((msg) => {
      const prefix = msg.role === 'user' ? 'User' : 'AI';
      // 我們只關心對話內容，忽略 evaluation 物件
      return `${prefix}: ${msg.content}`;
    })
    .join('\n');
}

/**
 * 等待指定的毫秒數。
 * @param ms 等待的毫秒數
 * @returns 一個 Promise，在指定的時間後會被解決
 */

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
