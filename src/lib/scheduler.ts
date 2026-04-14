import { db } from './db';
import { initDb } from './init-db';
import { addMinutes, formatDateKey, formatTimeHHmm, getNowKST } from './time';
import { sendPushToAll } from './push';

initDb();

let schedulerStarted = false;

function hasLog(taskId: number, dateKey: string, stage: 'initial' | 'reminder') {
  const row = db
    .prepare(`SELECT id FROM notification_logs WHERE task_id = ? AND date_key = ? AND stage = ? LIMIT 1`)
    .get(taskId, dateKey, stage);
  return !!row;
}

function insertLog(taskId: number, dateKey: string, stage: 'initial' | 'reminder') {
  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT OR IGNORE INTO notification_logs (task_id, date_key, stage, sent_at)
    VALUES (?, ?, ?, ?)
  `).run(taskId, dateKey, stage, nowIso);
}

function getTasks() {
  return db.prepare(`
    SELECT id, title, notify_time as notifyTime, completed, created_at as createdAt, updated_at as updatedAt
    FROM tasks
    ORDER BY id DESC
  `).all() as Array<{
    id: number;
    title: string;
    notifyTime: string;
    completed: number;
  }>;
}

async function checkNotifications() {
  const now = getNowKST();
  const dateKey = formatDateKey(now);
  const currentHHmm = formatTimeHHmm(now);
  const currentTimeValue = now.getHours() * 60 + now.getMinutes();
  const tasks = getTasks();

  for (const task of tasks) {
    if (task.completed) continue;

    const [hourStr, minuteStr] = task.notifyTime.split(':');
    const baseMinutes = Number(hourStr) * 60 + Number(minuteStr);
    const reminderMinutes = baseMinutes + 30;

    const shouldSendInitial = currentTimeValue === baseMinutes && !hasLog(task.id, dateKey, 'initial');
    const shouldSendReminder = currentTimeValue === reminderMinutes && !hasLog(task.id, dateKey, 'reminder');

    if (shouldSendInitial) {
      await sendPushToAll('할 일 알림', `${task.title} 할 시간이에요.`, '/');
      insertLog(task.id, dateKey, 'initial');
      console.log(`[${currentHHmm}] initial sent for task ${task.id}`);
    }

    if (shouldSendReminder) {
      const stillOpen = db.prepare(`SELECT completed FROM tasks WHERE id = ?`).get(task.id) as { completed: number } | undefined;
      if (stillOpen && stillOpen.completed === 0) {
        await sendPushToAll('재알림', `${task.title} 아직 완료하지 않았어요.`, '/');
        insertLog(task.id, dateKey, 'reminder');
        console.log(`[${currentHHmm}] reminder sent for task ${task.id}`);
      }
    }
  }
}

export function startScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  checkNotifications().catch(console.error);

  setInterval(() => {
    checkNotifications().catch(console.error);
  }, 60 * 1000);
}