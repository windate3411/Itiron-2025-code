// app/api/judge0/execute/route.ts
import { NextResponse } from 'next/server';
import { executeCode } from '@/app/lib/judge0';

export async function POST(request: Request) {
  try {
    const { source_code } = await request.json();

    if (!source_code) {
      return NextResponse.json({ error: '缺少 source_code' }, { status: 400 });
    }

    const result = await executeCode(source_code);
    return NextResponse.json(result);
  } catch (error) {
    console.error('代理 /api/judge0/execute 錯誤:', error);
    return NextResponse.json({ error: '代理伺服器內部錯誤' }, { status: 500 });
  }
}
