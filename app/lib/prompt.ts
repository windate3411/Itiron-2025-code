// 保持模板的獨立性，使其易於管理和修改
export const unifiedPromptTemplate = `<role>
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

interface PromptContext {
  formattedHistory: string;
  question: string;
  ragContext: string;
  judge0Result: string;
  userAnswer: string;
}

/**
 * 根據上下文填充統一的 Prompt 模板。
 * @param context 包含所有需要填充的資訊的物件
 * @returns 填充完畢的最終 Prompt 字串
 */
export function buildUnifiedPrompt(context: PromptContext): string {
  return unifiedPromptTemplate
    .replace(/\${formattedHistory}/g, context.formattedHistory)
    .replace(/\${question}/g, context.question)
    .replace(/\${ragContext}/g, context.ragContext)
    .replace(/\${judge0Result}/g, context.judge0Result)
    .replace(/\${userAnswer}/g, context.userAnswer);
}
