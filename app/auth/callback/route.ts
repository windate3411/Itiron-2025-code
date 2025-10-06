// app/auth/callback/route.ts
import { createAuthClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 驗證成功，重定向到 dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 如果有錯誤，重定向回登入頁面
  return NextResponse.redirect(
    `${origin}/auth?message=${encodeURIComponent('驗證失敗，請重試')}`
  );
}
