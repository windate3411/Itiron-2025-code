// app/api/interview/evaluate/route.ts
import { NextResponse } from 'next/server';
import questions from '@/data/questions.json';
import { formatChatHistory } from '@/app/lib/utils';
import { buildUnifiedPrompt } from '@/app/lib/prompt';
import { performRagSearch } from '@/app/lib/supabase/server';
import { generateEmbedding, generateContentStream } from '@/app/lib/gemini';
import { getFormattedJudge0Result } from '@/app/lib/judge0';
import {
  createAuthClient,
  supabase as adminSupabase,
} from '@/app/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // 1. 驗證使用者身分
    const supabase = await createAuthClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. 取得 isFollowUp 旗標
    const { questionId, answer, history, isFollowUp } = await request.json();

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
      isFollowUp,
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

    const stream = await generateContentStream(
      finalPrompt,
      async (fullJson) => {
        // 這個函式會在 gemini.ts 中被呼叫
        // 只有在不是追問的情況下，才執行資料庫寫入
        if (!isFollowUp) {
          try {
            const finalEvaluation = JSON.parse(fullJson);
            const recordToInsert = {
              user_id: user.id,
              question_id: questionId,
              user_answer: answer,
              evaluation: finalEvaluation,
              score: finalEvaluation.score,
            };

            const { error: insertError } = await adminSupabase
              .from('practice_records')
              .insert(recordToInsert);

            if (insertError) {
              console.error('Error in onComplete DB write:', insertError);
            }
          } catch (e) {
            console.error('Failed to parse or insert record in onComplete:', e);
          }
        }
      }
    );
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
