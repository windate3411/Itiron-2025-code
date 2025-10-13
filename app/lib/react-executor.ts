// app/lib/react-executor.ts
import Babel from '@babel/standalone';
import React from 'react';
import { renderToString } from 'react-dom/server';

// 為了方便管理，我們先定義好測試案例和結果的型別
export interface ReactTestCase {
  name: string;
  props?: Record<string, string>;
  expectedPatterns?: string[];
}

export interface TestCaseResult {
  name: string;
  passed: boolean;
  actual: string;
  expected?: string[];
  missing?: string[];
  error?: string;
}

/**
 * 評測 React 元件的主函式，整合了轉譯、建立、渲染和驗證的所有步驟。
 * @param userJsxCode 使用者提交的 JSX 程式碼字串
 * @param testCases 測試案例陣列
 * @returns 一個包含每個測試案例評測結果的 Promise
 */
export async function evaluateReactComponent(
  userJsxCode: string,
  testCases: ReactTestCase[]
): Promise<{ success: boolean; results: TestCaseResult[]; error?: string }> {
  try {
    // 步驟 1: 轉譯 JSX 為純 JavaScript
    const transpiledCode = Babel.transform(userJsxCode, {
      presets: ['react'],
    }).code;
    if (!transpiledCode) throw new Error('Babel 轉譯返回空程式碼');

    // 步驟 2: 清理 import/export 語句
    const cleanedCode = transpiledCode
      .replace(/import\s+.*?from\s+.*?['"];?\s*/g, '')
      .replace(/export\s+default\s+/g, '')
      .trim();

    // 步驟 3: 使用 new Function 從字串安全地建立元件
    const componentFactory = new Function(
      'React',
      'useState',
      `
      ${cleanedCode}
      // 假設使用者的元件名稱為 Counter，未來可改進為更通用的方式
      return Counter; 
    `
    );
    const UserComponent = componentFactory(React, React.useState);
    if (typeof UserComponent !== 'function') {
      throw new Error('從程式碼建立的元件不是一個有效的函式');
    }

    // 步驟 4: 執行所有測試案例
    const results = testCases.map((testCase): TestCaseResult => {
      try {
        const element = React.createElement(
          UserComponent,
          testCase.props || {}
        );
        const actualHtml = renderToString(element);
        const expectedPatterns = testCase.expectedPatterns || [];
        const missing = expectedPatterns.filter(
          (pattern) => !actualHtml.includes(pattern)
        );

        return {
          name: testCase.name,
          passed: missing.length === 0,
          actual: actualHtml,
          expected: expectedPatterns,
          missing: missing.length > 0 ? missing : undefined,
        };
      } catch (renderError: unknown) {
        return {
          name: testCase.name,
          passed: false,
          actual: `渲染時發生錯誤: ${
            renderError instanceof Error
              ? renderError.message
              : String(renderError)
          }`,
        };
      }
    });

    return { success: true, results };
  } catch (error: unknown) {
    // 捕捉轉譯或元件建立階段的錯誤
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
