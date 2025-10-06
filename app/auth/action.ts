// app/auth/action.ts
'use server';

import { createAuthClient } from '@/app/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createAuthClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message = '登入失敗，請檢查您的帳號或密碼';
    return redirect(`/auth?message=${encodeURIComponent(message)}`);
  }

  revalidatePath('/', 'layout');
  return redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const origin = (await headers()).get('origin');
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createAuthClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    const message = '註冊失敗，該信箱可能已被使用';
    return redirect(`/auth?message=${encodeURIComponent(message)}`);
  }

  revalidatePath('/', 'layout');
  const message = '註冊成功！請檢查您的信箱以完成驗證';
  return redirect(`/auth?message=${encodeURIComponent(message)}`);
}
