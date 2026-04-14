import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initDb } from '@/lib/init-db';
import { getPublicVapidKey } from '@/lib/push';
import { requireAuth } from '@/lib/auth';

initDb();

export async function GET() {
  return NextResponse.json({ publicKey: getPublicVapidKey() });
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const endpoint = body?.endpoint;
    const p256dh = body?.keys?.p256dh;
    const auth = body?.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: '잘못된 구독 정보입니다.' }, { status: 400 });
    }

    db.prepare(`
      INSERT INTO push_subscriptions (endpoint, p256dh, auth, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(endpoint) DO UPDATE SET
        p256dh = excluded.p256dh,
        auth = excluded.auth
    `).run(endpoint, p256dh, auth, new Date().toISOString());

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }
}