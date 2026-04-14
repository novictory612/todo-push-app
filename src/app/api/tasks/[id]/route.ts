import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initDb } from '@/lib/init-db';
import { requireAuth } from '@/lib/auth';

initDb();

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await context.params;

    db.prepare(`DELETE FROM notification_logs WHERE task_id = ?`).run(id);
    db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }
}