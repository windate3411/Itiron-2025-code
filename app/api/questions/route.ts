import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { Question } from '@/app/types/question';

export async function GET(request: Request) {
  try {
    // 從 URL 查詢參數中取得 type 和 topic 參數
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const topic = searchParams.get('topic');
    // 找到 public 資料夾的路徑
    const jsonDirectory = path.join(process.cwd(), 'data');
    // 讀取 JSON 檔案
    const fileContents = await fs.readFile(
      jsonDirectory + '/questions.json',
      'utf8'
    );
    // 解析 JSON 內容
    const questions = JSON.parse(fileContents);

    // 過濾題目
    const filteredQuestions = questions.filter((question: Question) => {
      let matches = true;
      
      // 如果指定了 topic，按 topic 過濾
      if (topic) {
        matches = matches && question.topic === topic;
      }
      
      // 如果指定了 type，按 type 過濾
      if (type && (type === 'code' || type === 'concept')) {
        matches = matches && question.type === type;
      }
      
      return matches;
    });

    // 從對應題型的題庫中隨機選一題
    const randomQuestion =
      filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];

    return NextResponse.json(randomQuestion);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '無法讀取題庫' }, { status: 500 });
  }
}
