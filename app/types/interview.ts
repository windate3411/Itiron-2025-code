export interface Evaluation {
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  evaluation?: Evaluation;
}
