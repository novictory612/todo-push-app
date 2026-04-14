import webpush from 'web-push';
import { db } from './db';
import { initDb } from './init-db';

initDb();

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@example.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export function getPublicVapidKey() {
  return process.env.VAPID_PUBLIC_KEY || '';
}

export function getAllSubscriptions() {
  const stmt = db.prepare(`
    SELECT id, endpoint, p256dh, auth, created_at as createdAt
    FROM push_subscriptions
    ORDER BY id DESC
  `);
  return stmt.all();
}

export async function sendPushToAll(title: string, body: string, url = '/') {
  const subs = getAllSubscriptions() as Array<{
    id: number;
    endpoint: string;
    p256dh: string;
    auth: string;
  }>;

  const payload = JSON.stringify({
    title,
    body,
    url,
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      );
    } catch (error: any) {
      const statusCode = error?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        db.prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?`).run(sub.endpoint);
      } else {
        console.error('Push send error:', error?.message || error);
      }
    }
  }
}