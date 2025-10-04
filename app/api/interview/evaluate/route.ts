// app/api/interview/evaluate/route.ts
import { NextResponse } from 'next/server';
import questions from '@/data/questions.json';
import { formatChatHistory } from '@/app/lib/utils';
import { buildUnifiedPrompt } from '@/app/lib/prompt';
import { performRagSearch } from '@/app/lib/supabase';
import { generateEmbedding, generateContentStream } from '@/app/lib/gemini';
import { getFormattedJudge0Result } from '@/app/lib/judge0';

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
      const answerEmbedding = await generateEmbedding(answer);
      ragContext = await performRagSearch(answerEmbedding, questionId);
    } else if (question.type === 'code') {
      judge0ResultText = await getFormattedJudge0Result(answer);
    }

    // 填充統一的 Prompt 模板
    const finalPrompt = buildUnifiedPrompt({
      formattedHistory,
      question: question.question,
      ragContext,
      judge0Result: judge0ResultText,
      userAnswer: answer,
    });

    if (!finalPrompt) {
      return NextResponse.json(
        { error: 'Invalid question type' },
        { status: 400 }
      );
    }

    const stream = await generateContentStream(finalPrompt);
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
