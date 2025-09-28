// app/api/judge0/execute/route.ts
import { NextResponse } from 'next/server';

const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
// JavaScript 的語言 ID 在 Judge0 中是 93 (Node.js 18.15.0)
const JAVASCRIPT_LANGUAGE_ID = 93;

// 輔助函式：用於延遲
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  if (!JUDGE0_API_HOST || !JUDGE0_API_KEY) {
    return NextResponse.json(
      { error: 'Judge0 API 環境變數未設定' },
      { status: 500 }
    );
  }

  try {
    const { source_code } = await request.json();
    if (!source_code) {
      return NextResponse.json({ error: '缺少 source_code' }, { status: 400 });
    }

    // --- Step 1: 提交程式碼 (Base64 編碼) ---
    const encodedSourceCode = Buffer.from(source_code).toString('base64');

    const submissionResponse = await fetch(
      // 關鍵：base64_encoded=true
      `https://${JUDGE0_API_HOST}/submissions?base64_encoded=true&wait=false`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': JUDGE0_API_HOST,
        },
        body: JSON.stringify({
          source_code: encodedSourceCode, // 送出編碼後的程式碼
          language_id: JAVASCRIPT_LANGUAGE_ID,
        }),
      }
    );

    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();
      console.error('Judge0 submission failed:', errorText);
      return NextResponse.json(
        { error: '提交至 Judge0 失敗', details: errorText },
        { status: submissionResponse.status }
      );
    }

    const submissionResult = await submissionResponse.json();
    const { token } = submissionResult;

    if (!token) {
      return NextResponse.json(
        { error: '無法從 Judge0 取得 Token' },
        { status: 500 }
      );
    }

    // --- Step 2: 輪詢 (Polling) 取得執行結果 ---
    let resultData;
    const maxRetries = 10;
    const retryDelay = 500;

    for (let i = 0; i < maxRetries; i++) {
      await sleep(retryDelay);

      const resultResponse = await fetch(
        // 關鍵：base64_encoded=true
        `https://${JUDGE0_API_HOST}/submissions/${token}?base64_encoded=true`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': JUDGE0_API_HOST,
          },
        }
      );

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text();
        return NextResponse.json(
          { error: '從 Judge0 獲取結果失敗', details: errorText },
          { status: resultResponse.status }
        );
      }

      resultData = await resultResponse.json();

      if (resultData.status_id > 2) {
        // 1: In Queue, 2: Processing
        break; // 執行完成 (成功、失敗、超時等)
      }
    }

    if (!resultData || resultData.status_id <= 2) {
      return NextResponse.json({ error: '程式碼執行超時' }, { status: 408 });
    }

    // --- Step 3: 解碼 Base64 結果 ---
    const decodedResult = {
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

    return NextResponse.json(decodedResult);
  } catch (error) {
    console.error('代理 /api/judge0/execute 錯誤:', error);
    return NextResponse.json({ error: '代理伺服器內部錯誤' }, { status: 500 });
  }
}
