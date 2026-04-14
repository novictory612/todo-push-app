import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = body?.userId?.trim();
  const password = body?.password?.trim();

  if (!userId || !password) {
    return NextResponse.json(
      { error: '아이디와 비밀번호를 입력하세요.' },
      { status: 400 }
    );
  }

  if (
    userId !== process.env.APP_USER_ID ||
    password !== process.env.APP_USER_PASSWORD
  ) {
    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }

  const token = signToken({ userId });
  const response = NextResponse.json({ ok: true });

  response.cookies.set('todo_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}