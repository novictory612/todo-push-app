import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initDb } from '@/lib/init-db';
import { requireAuth } from '@/lib/auth';

initDb();

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const endpoint = body?.endpoint;

    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint가 필요합니다.' }, { status: 400 });
    }

    db.prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?`).run(endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }
}