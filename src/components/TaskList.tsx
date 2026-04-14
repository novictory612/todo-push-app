'use client';

import { useRouter } from 'next/navigation';

type Task = {
  id: number;
  title: string;
  notifyTime: string;
  completed: number;
};

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();

  async function handleDelete(id: number) {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
  }

  async function handleComplete(id: number) {
    const res = await fetch(`/api/tasks/${id}/complete`, { method: 'PATCH' });
    if (res.ok) router.refresh();
  }

  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 12 }}>할 일 목록</div>
      {initialTasks.length === 0 ? (
        <div className="small">등록된 할 일이 없습니다.</div>
      ) : (
        initialTasks.map((task) => (
          <div className="task-item" key={task.id}>
            <div className="task-top">
              <div className={task.completed ? 'task-title completed' : 'task-title'}>{task.title}</div>
            </div>
            <div className="task-meta">알림 시간: {task.notifyTime}</div>
            <div className="row" style={{ marginTop: 10 }}>
              {!task.completed && (
                <button className="btn success" onClick={() => handleComplete(task.id)}>
                  완료
                </button>
              )}
              <button className="btn danger" onClick={() => handleDelete(task.id)}>
                삭제
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}