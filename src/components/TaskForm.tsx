'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TaskForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [notifyTime, setNotifyTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('제목을 입력하세요.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, notifyTime }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || '추가 실패');
      return;
    }

    setTitle('');
    setNotifyTime('09:00');
    router.refresh();
  }

  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 12 }}>할 일 추가</div>
      <form onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="예: 영어 단어 외우기"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="time-input"
          type="time"
          value={notifyTime}
          onChange={(e) => setNotifyTime(e.target.value)}
        />
        {error ? <div className="small" style={{ color: 'red', marginBottom: 10 }}>{error}</div> : null}
        <button className="btn" disabled={loading}>
          {loading ? '추가 중...' : '추가'}
        </button>
      </form>
    </div>
  );
}