// app/api/interview/evaluate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Content } from '@google/genai';
import questions from '@/data/questions.json';
import { ChatMessage } from '@/app/types/interview';
// --- 初始化客戶端 ---
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function formatChatHistory(history: ChatMessage[]): string {
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

const unifiedPromptTemplate = `<role>
You are a world-class senior frontend technical interviewer providing a comprehensive evaluation.
</role>
<task>
Carefully analyze the user's answer based on the provided context. Your evaluation must be grounded in the evidence given.

- **If the question is conceptual (i.e., <judge0_result> contains 'not applicable for this question')**:
  - Base your evaluation on how well the <user_answer> aligns with the key points in <rag_context>.
  - The \`grounded_evidence\` field in your JSON response MUST be \`null\`.

- **If the question is a coding challenge (i.e., <rag_context> contains 'not applicable for this question')**:
  - Base your evaluation strictly on the objective <judge0_result> and an analysis of the <user_answer> (which is user's code).
  - The \`grounded_evidence\` field in your JSON response MUST be populated with data from the execution results.

Always refer to the <conversation_history> for dialogue context.
Your response MUST be a single, valid JSON object following the schema. Answer in Traditional Chinese.
</task>
<json_schema>
{
  "summary": "string",
  "score": "number (1-5)",
  "grounded_evidence": { "tests_passed": "number|null", "tests_failed": "number|null", "stderr_excerpt": "string|null" } | null,
  "pros": ["string"],
  "cons": ["string"],
  "next_practice": ["string"]
}
</json_schema>
<conversation_history>
\${formattedHistory}
</conversation_history>
<question>
\${question}
</question>
<rag_context>
\${ragContext}
</rag_context>
<judge0_result>
\${judge0Result}
</judge0_result>
<user_answer>
\${userAnswer}
</user_answer>`;

export async function POST(request: Request) {
  try {
    const { questionId, answer, history } = await request.json();

    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // 準備所有需要的上下文變數
    const formattedHistory = formatChatHistory(history);
    let ragContext = 'not applicable for this question';
    let judge0ResultText = 'not applicable for this question';

    if (question.type === 'concept') {
      // --- 概念題路徑 (RAG) ---
      const embeddingResponse = await genAI.models.embedContent({
        model: 'gemini-embedding-001',
        contents: answer,
        config: {
          outputDimensionality: 768,
        },
      });
      if (
        !embeddingResponse.embeddings ||
        embeddingResponse.embeddings.length === 0
      ) {
        return NextResponse.json(
          { error: 'Embedding response is empty' },
          { status: 500 }
        );
      }
      const answerEmbedding = embeddingResponse.embeddings[0].values;

      const { data: ragData, error: ragError } = await supabase.rpc(
        'match_documents',
        {
          query_embedding: JSON.stringify(answerEmbedding),
          match_threshold: 0.7,
          match_count: 5,
          p_question_id: questionId,
        }
      );

      ragContext =
        !ragError && ragData?.length > 0
          ? ragData.map((d: { content: string }) => `- ${d.content}`).join('\n')
          : 'No relevant context found.';
    } else if (question.type === 'code') {
      const judge0Response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/judge0/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source_code: answer }),
        }
      );

      const judge0Result = await judge0Response.json();
      judge0ResultText = `Status: ${judge0Result.status.description}\nStdout: ${
        judge0Result.stdout || 'N/A'
      }\nStderr: ${judge0Result.stderr || 'N/A'}`;
    }

    // 填充統一的 Prompt 模板
    const finalPrompt = unifiedPromptTemplate
      .replace(/\${formattedHistory}/g, formattedHistory)
      .replace(/\${question}/g, question.question)
      .replace(/\${ragContext}/g, ragContext)
      .replace(/\${judge0Result}/g, judge0ResultText)
      .replace(/\${userAnswer}/g, answer);

    if (!finalPrompt) {
      return NextResponse.json(
        { error: 'Invalid question type' },
        { status: 400 }
      );
    }

    const contents: Content[] = [{ parts: [{ text: finalPrompt }] }];

    const result = await genAI.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result) {
          // 確保我們只傳遞有內容的文字部分
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error in evaluation API:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
