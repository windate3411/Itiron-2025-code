async function runTest(description, source_code) {
  console.log(`\n--- 測試案例: ${description} ---`);
  try {
    const response = await fetch('http://localhost:3000/api/judge0/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_code }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  ❌ 請求失敗 (${response.status}):`);
      console.error('--- Server Response ---');
      console.error(errorText);
      console.error('--- End Server Response ---');
      return;
    }

    const data = await response.json();
    console.log('  ✅ 成功從代理 API 收到回應:');

    const relevantData = {
      stdout: data.stdout,
      stderr: data.stderr,
      status: data.status,
      time: data.time,
      memory: data.memory,
    };
    console.log(JSON.stringify(relevantData, null, 2));
  } catch (error) {
    console.error('  ❌ 執行測試時發生網路或其他錯誤:', error.message);
  }
}

async function main() {
  // 測試 1: 正常的 console.log
  const codeSuccess = `console.log('Hello from the secure sandbox!');`;
  await runTest('正常執行的程式碼', codeSuccess);

  // 測試 2: 會產生執行階段錯誤 (Runtime Error) 的程式碼，並包含中文註解
  const codeError = `const a = 1;\na.toUpperCase(); // 這會產生 TypeError`;
  await runTest('會產生執行階段錯誤 (Runtime Error) 的程式碼', codeError);

  // 測試 3: 語法錯誤的程式碼
  const codeSyntaxError = `console.log('Missing quote);`;
  await runTest('語法錯誤 (Syntax Error) 的程式碼', codeSyntaxError);

  // 測試 4: 包含中文字串的正常程式碼
  const codeUnicode = `console.log('你好，世界！');`;
  await runTest('包含 Unicode (中文) 字串的程式碼', codeUnicode);
}

main();
