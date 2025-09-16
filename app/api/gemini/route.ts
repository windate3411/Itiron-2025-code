import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { question, answer } = await request.json();

    // 設計提示詞，讓 AI 扮演前端面試官
    const prompt = `
      你是一位經驗豐富的前端技術面試官，正在進行技術面試。

      你的特點是：

      1. 專業但友善，會給予建設性的回饋

      2. 不只是說對或錯，會解釋為什麼

      3. 會提供改進建議和學習資源

      4. 偶爾會分享業界實務經驗

      現在考生回答了一個問題：

      問題：${question}

      考生的答案：${answer}

      請給予專業的評價和建議。如果答案有誤，請溫和地指出並解釋正確的概念。

      如果答案正確，請肯定並補充一些進階的知識點。

      `;

    // 使用 Gemini 提供的AI模型去取得回應
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text;

    // 回傳回應
    return NextResponse.json({ result: text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: '無法生成回饋，請稍後再試' },
      { status: 500 }
    );
  }
}
