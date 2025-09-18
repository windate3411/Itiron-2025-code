import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // 找到 public 資料夾的路徑
    const jsonDirectory = path.join(process.cwd(), 'data');
    // 讀取 JSON 檔案
    const fileContents = await fs.readFile(
      jsonDirectory + '/questions.json',
      'utf8'
    );
    // 解析 JSON 內容
    const questions = JSON.parse(fileContents);

    // 從題庫中隨機選一題
    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    return NextResponse.json(randomQuestion);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '無法讀取題庫' }, { status: 500 });
  }
}
