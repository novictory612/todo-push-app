import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initDb } from '@/lib/init-db';
import { requireAuth } from '@/lib/auth';

initDb();

export async function GET() {
  try {
    await requireAuth();
    const tasks = db.prepare(`
      SELECT id, title, notify_time as notifyTime, completed, created_at as createdAt, updated_at as updatedAt
      FROM tasks
      ORDER BY completed ASC, notify_time ASC, id DESC
    `).all();
    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const title = body?.title?.trim();
    const notifyTime = body?.notifyTime?.trim();

    if (!title || !notifyTime || !/^\d{2}:\d{2}$/.test(notifyTime)) {
      return NextResponse.json({ error: '제목과 알림 시간을 올바르게 입력하세요.' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();

    const result = db.prepare(`
      INSERT INTO tasks (title, notify_time, completed, created_at, updated_at)
      VALUES (?, ?, 0, ?, ?)
    `).run(title, notifyTime, nowIso, nowIso);

    return NextResponse.json({ ok: true, id: result.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }
}