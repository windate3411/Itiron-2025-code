// app/api/interview/evaluate/route.ts
import { NextResponse } from 'next/server';
import questionsData from '@/data/questions.json';
import { formatChatHistory } from '@/app/lib/utils';
import { buildUnifiedPrompt } from '@/app/lib/prompt';
import { performRagSearch } from '@/app/lib/supabase/server';
import { generateEmbedding, generateContentStream } from '@/app/lib/gemini';
import { getFormattedJudge0Result } from '@/app/lib/judge0';
import {
  createAuthClient,
  supabase as adminSupabase,
} from '@/app/lib/supabase/server';
import {
  evaluateReactComponent,
  ReactTestCase,
  TestCaseResult,
} from '@/app/lib/react-executor';
import { Question } from '@/app/types/question';

const questions = questionsData as Question[];
function formatReactEvaluationResults(
  results: TestCaseResult[],
  error?: string
): string {
  if (error) {
    return `❌ 評測過程發生錯誤：${error}\n\n請檢查你的程式碼是否有語法錯誤或其他問題。`;
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  let output = `## 測試結果總覽\n通過: ${passedCount}/${totalCount}\n\n`;

  results.forEach((result, index) => {
    output += `### 測試案例 ${index + 1}: ${result.name}\n`;

    if (result.passed) {
      output += `✅ **通過**\n`;
      output += `渲染結果符合預期\n\n`;
    } else {
      output += `❌ **失敗**\n`;

      if (result.missing && result.missing.length > 0) {
        output += `缺少以下預期內容:\n`;
        result.missing.forEach((pattern) => {
          output += `  - "${pattern}"\n`;
        });
      }

      output += `\n實際渲染的 HTML:\n\`\`\`html\n${result.actual}\n\`\`\`\n\n`;
    }
  });

  return output;
}

/**
 * 準備評估所需的上下文資料
 */
async function prepareEvaluationContext(
  question: Question,
  userAnswer: string
) {
  let judge0Result = 'not applicable for this question'; // 一般程式題結果
  let reactTestResult = 'not applicable for this question'; // React 測試結果（新增）
  let ragContext = 'not applicable for this question';

  // ========================================
  // React 程式題：使用我們的原生評測引擎
  // ========================================
  if (question.topic === 'React' && question.type === 'code') {
    console.log('🎯 偵測到 React 程式題，使用原生評測引擎');

    const testCases: ReactTestCase[] = question.testCases || [];

    const evaluation = await evaluateReactComponent(userAnswer, testCases);

    reactTestResult = formatReactEvaluationResults(
      evaluation.results,
      evaluation.error
    );

    console.log('✅ React 評測完成');
  }
  // ========================================
  // 一般程式題：使用 Judge0
  // ========================================
  else if (question.type === 'code') {
    console.log('📝 偵測到一般程式題，使用 Judge0');
    judge0Result = await getFormattedJudge0Result(userAnswer);
  }

  // ========================================
  // 概念題：使用 RAG
  // ========================================
  if (question.type === 'concept') {
    console.log('💡 偵測到概念題，執行 RAG 搜尋');
    const answerEmbedding = await generateEmbedding(userAnswer);
    ragContext = await performRagSearch(answerEmbedding, question.id);
  }

  return { ragContext, judge0Result, reactTestResult }; // 回傳三個欄位
}

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

    const { ragContext, judge0Result, reactTestResult } =
      await prepareEvaluationContext(question, answer);

    // 填充統一的 Prompt 模板
    const finalPrompt = buildUnifiedPrompt({
      isFollowUp,
      formattedHistory,
      question: question.question,
      ragContext,
      judge0Result: judge0Result,
      userAnswer: answer,
      reactTestResult: reactTestResult,
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
