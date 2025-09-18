/**
 * 定義單一測試案例的結構
 */
export interface TestCase {
  name: string; // 測試案例的名稱，例如 "基本攤平"
  setup: string; // 執行測試前需要的前置程式碼，YOUR_CODE_HERE 會被替換成使用者的程式碼
  test: string; // 實際執行的測試程式碼
  expected: string; // 預期的 console.log 輸出結果
}

/**
 * 定義一個完整題目的結構
 */
export interface Question {
  id: string;
  topic: string;
  type: 'concept' | 'code';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  hints: string[];
  keyPoints: string[];
  starterCode: string | null;
  testCases: TestCase[] | null;
}
