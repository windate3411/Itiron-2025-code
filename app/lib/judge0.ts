// app/lib/judge0.ts
import { retryAsyncFunction, sleep } from './utils'; // 從 utils 引入需要的函數

// 為了更清晰的型別定義，我們可以為 Judge0 的回傳結果建立一個 interface
export interface Judge0ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
}

const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JAVASCRIPT_LANGUAGE_ID = 93;

/**
 * 【核心引擎】執行程式碼並取得結構化的 JSON 結果。
 * 這個函式處理與 Judge0 API 的直接通訊、輪詢和解碼。
 * @param source_code 要執行的原始碼
 * @returns 包含執行結果的物件
 * @throws 如果環境變數未設定、API 呼叫失敗或超時，則拋出錯誤
 */
export async function executeCode(
  source_code: string
): Promise<Judge0ExecutionResult> {
  if (!JUDGE0_API_HOST || !JUDGE0_API_KEY) {
    console.error('Judge0 API environment variables are not set.');
    throw new Error('Judge0 服務設定不完整。');
  }

  // Step 1: 提交程式碼
  const encodedSourceCode = Buffer.from(source_code).toString('base64');
  const submissionResponse = await fetch(
    `https://${JUDGE0_API_HOST}/submissions?base64_encoded=true&wait=false`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': JUDGE0_API_HOST,
      },
      body: JSON.stringify({
        source_code: encodedSourceCode,
        language_id: JAVASCRIPT_LANGUAGE_ID,
      }),
    }
  );

  if (!submissionResponse.ok) {
    const errorText = await submissionResponse.text();
    throw new Error(`提交至 Judge0 失敗: ${errorText}`);
  }

  const { token } = await submissionResponse.json();
  if (!token) throw new Error('無法從 Judge0 取得 Token');

  // Step 2: 輪詢結果
  let resultData;
  for (let i = 0; i < 10; i++) {
    await sleep(500);
    const resultResponse = await fetch(
      `https://${JUDGE0_API_HOST}/submissions/${token}?base64_encoded=true`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': JUDGE0_API_HOST,
        },
      }
    );
    if (!resultResponse.ok) continue; // 如果輪詢失敗，繼續嘗試

    resultData = await resultResponse.json();
    if (resultData.status_id > 2) break; // 執行完成
  }

  if (!resultData || resultData.status_id <= 2) {
    throw new Error('程式碼執行超時');
  }

  // Step 3: 解碼並回傳
  return {
    ...resultData,
    stdout: resultData.stdout
      ? Buffer.from(resultData.stdout, 'base64').toString('utf-8')
      : null,
    stderr: resultData.stderr
      ? Buffer.from(resultData.stderr, 'base64').toString('utf-8')
      : null,
    compile_output: resultData.compile_output
      ? Buffer.from(resultData.compile_output, 'base64').toString('utf-8')
      : null,
  };
}

/**
 * 【對外接口 for Evaluate API】執行程式碼並回傳格式化後的純文字結果。
 * 這個函式封裝了重試邏輯和結果格式化，專門給 Prompt 使用。
 * @param code 使用者提交的原始碼
 * @returns 格式化後的執行結果字串
 */
export async function getFormattedJudge0Result(code: string): Promise<string> {
  try {
    // 使用 retryAsyncFunction 來增加呼叫核心引擎的穩健性
    const result = await retryAsyncFunction(
      () => executeCode(code),
      3,
      1000,
      (error, attempt) =>
        console.warn(
          `Judge0 execution attempt ${attempt} failed: ${error.message}`
        )
    );

    // 將成功的結果格式化為 Prompt 需要的字串
    return `Status: ${result.status?.description || 'N/A'}\nStdout: ${
      result.stdout || 'N/A'
    }\nStderr: ${result.stderr || 'N/A'}`;
  } catch (error) {
    console.error('Judge0 execution failed after all retries:', error);
    // 如果最終失敗，回傳一個友善的錯誤訊息給 Prompt
    return '程式碼執行服務暫時無法連線，無法取得客觀執行結果。';
  }
}
