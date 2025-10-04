// app/lib/gemini.ts
import { GoogleGenAI, Content } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

export const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * 生成文字的 Embedding 向量
 * @param text 要轉換成向量的文字
 * @returns 768 維的向量陣列
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddingResponse = await genAI.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  if (
    !embeddingResponse.embeddings ||
    embeddingResponse.embeddings.length === 0
  ) {
    throw new Error('Embedding response is empty');
  }

  return embeddingResponse.embeddings[0].values || [];
}

/**
 * 使用 Gemini 生成串流回應
 * @param prompt 完整的 prompt 文字
 * @returns ReadableStream 用於串流回應
 */
export async function generateContentStream(
  prompt: string
): Promise<ReadableStream> {
  const contents: Content[] = [{ parts: [{ text: prompt }] }];

  const result = await genAI.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      responseMimeType: 'application/json',
    },
  });

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });
}

/**
 * 使用 Gemini 生成完整回應 (非串流)
 * @param prompt 完整的 prompt 文字
 * @returns 生成的文字內容
 */
export async function generateContent(prompt: string): Promise<string> {
  const contents: Content[] = [{ parts: [{ text: prompt }] }];

  const result = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      responseMimeType: 'application/json',
    },
  });

  return result.text || '';
}
