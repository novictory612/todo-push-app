import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import PushPermission from '@/components/PushPermission';
import { db } from '@/lib/db';
import { initDb } from '@/lib/init-db';

initDb();

export default async function HomePage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const tasks = db.prepare(`
    SELECT id, title, notify_time as notifyTime, completed, created_at as createdAt, updated_at as updatedAt
    FROM tasks
    ORDER BY completed ASC, notify_time ASC, id DESC
  `).all();

  return (
    <main className="container">
      <div className="topbar">
        <div className="title" style={{ marginBottom: 0 }}>할 일 알림</div>
      </div>

      <PushPermission />
      <TaskForm />
      <TaskList initialTasks={tasks as any[]} />
    </main>
  );
}