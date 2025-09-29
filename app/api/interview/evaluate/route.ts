// app/api/interview/evaluate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Content } from '@google/genai';
import questions from '@/data/questions.json';

// --- 初始化客戶端 ---
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --- Prompt 模板 ---
const conceptPromptTemplate = `<role>
You are a senior frontend technical interviewer evaluating a candidate's answer to a conceptual question.
</role>
<task>
Evaluate the <candidate_answer> based on whether it covers the concepts in <rag_context>.
Your response MUST be a single, valid JSON object that adheres to the provided schema. In this conceptual evaluation, the "grounded_evidence" field MUST be null.
Answer in Traditional Chinese in a must.
</task>
<json_schema>
{
  "summary": "string",
  "score": "number (1-5)",
  "grounded_evidence": null,
  "pros": ["string"],
  "cons": ["string"],
  "next_practice": ["string"]
}
</json_schema>
<rag_context>
\${ragContext}
</rag_context>
<candidate_answer>
\${userAnswer}
</candidate_answer>`;

const codePromptTemplate = `<role>
You are a world-class senior frontend technical interviewer providing a comprehensive code review based strictly on the execution result and the code itself.
</role>
<task>
Evaluate the <user_code> based on the objective <judge0_result>. Analyze the code for quality, correctness, and best practices.
Your response MUST be a single, valid JSON object that adheres to the provided schema.
Answer in Traditional Chinese in a must.
</task>
<json_schema>
{
  "summary": "string",
  "score": "number (1-5)",
  "grounded_evidence": { "tests_passed": "number", "tests_failed": "number", "stderr_excerpt": "string|null" },
  "pros": ["string"],
  "cons": ["string"],
  "next_practice": ["string"]
}
</json_schema>
<judge0_result>
\${judge0Result}
</judge0_result>
<user_code>
\${userCode}
</user_code>`;

export async function POST(request: Request) {
  try {
    const { questionId, answer } = await request.json();

    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    let finalPrompt = '';

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
          question_id: questionId,
        }
      );

      const ragContext =
        !ragError && ragData?.length > 0
          ? ragData.map((d: { content: string }) => `- ${d.content}`).join('\n')
          : 'No relevant context found.';

      finalPrompt = conceptPromptTemplate.replace(
        /\${ragContext}/g,
        ragContext
      );
      finalPrompt = finalPrompt.replace(/\${userAnswer}/g, answer);

      console.log('finalPrompt', finalPrompt);
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
      const judge0ResultText = `Status: ${
        judge0Result.status.description
      }\nStdout: ${judge0Result.stdout || 'N/A'}\nStderr: ${
        judge0Result.stderr || 'N/A'
      }`;

      finalPrompt = codePromptTemplate.replace(
        /\${judge0Result}/g,
        judge0ResultText
      );

      finalPrompt = finalPrompt.replace(/\${userCode}/g, answer);
    }

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
