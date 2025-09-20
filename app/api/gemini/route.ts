import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { question, answer, keyPoints } = await request.json();

    // 設計提示詞，讓 AI 扮演前端面試官
    const prompt = `
      <role>
      You are a world-class senior frontend technical interviewer with over 10 years of experience. Your tone is professional, encouraging, and helpful. You are an expert in explaining complex concepts clearly.
      </role>

      <task>
      Your task is to evaluate a candidate's answer based on the provided "Evaluation Criteria". Follow these steps precisely:
      1.  **Analyze**: Go through each point in the "Evaluation Criteria" one by one and check if the candidate's "Answer" covers it.
      2.  **Feedback**: Provide detailed feedback strictly following the Markdown format in "<example_output>". For points the candidate got right, offer praise and add depth. For points the candidate missed, gently correct them and explain the concept.
      3.  **Summarize**: Conclude with an overall summary and suggest a next step for their learning. Don't be too long with the summary.
      4.  **Language**: All your output MUST be in Traditional Chinese (繁體中文).
      </task>
      
      <example_output>
      ### 綜合評估
      **✅ 答對部分**
      * 你很棒地解釋了 hoisting 的基本概念，提到「變數和函數宣告會被提升到其作用域的頂部」。這點完全正確！
      
      **🔍 可補充部分**
      * 可以更深入說明 **let 和 const** 的 hoisting 行為。雖然它們也會被提升，但因為「暫時性死區 (TDZ)」的存在，在宣告前存取會拋出錯誤，這點是和 var 的關鍵區別。
      </example_output>
      <question>
      ${question}
      </question>

      <candidate_answer>
      ${answer}
      </candidate_answer>

      <evaluation_criteria>
      ${keyPoints.map((point: string) => `- ${point}`).join('\n')}
      </evaluation_criteria>
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
