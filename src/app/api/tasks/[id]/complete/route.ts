import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initDb } from '@/lib/init-db';
import { requireAuth } from '@/lib/auth';

initDb();

export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await context.params;

    db.prepare(`
      UPDATE tasks
      SET completed = 1, updated_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }
}