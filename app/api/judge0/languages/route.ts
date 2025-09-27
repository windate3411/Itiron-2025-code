// app/api/judge0/languages/route.ts
import { NextResponse } from 'next/server';

const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

export async function GET() {
  // 再次檢查環境變數是否存在，確保伺服器配置正確
  if (!JUDGE0_API_HOST || !JUDGE0_API_KEY) {
    return NextResponse.json(
      { error: 'Judge0 API 環境變數未設定' },
      { status: 500 }
    );
  }

  const url = `https://${JUDGE0_API_HOST}/languages`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': JUDGE0_API_HOST,
    },
  };

  try {
    const response = await fetch(url, options);

    // 如果 Judge0 回傳非 200 的狀態碼，我們將錯誤資訊透傳給前端
    if (!response.ok) {
      const errorData = await response.text(); // 使用 .text() 以防回傳的不是 JSON
      return NextResponse.json(
        { error: '無法從 Judge0 獲取資料', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    // 成功取得資料後，將其回傳給前端
    return NextResponse.json(data);
  } catch (error) {
    console.error('代理請求至 Judge0 時發生網路或解析錯誤:', error);
    return NextResponse.json({ error: '代理伺服器內部錯誤' }, { status: 500 });
  }
}
