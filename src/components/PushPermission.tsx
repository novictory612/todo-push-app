'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushPermission() {
  const [supported, setSupported] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const ok =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window;
  setSupported(ok);
}, []);

  async function enablePush() {
    try {
      setLoading(true);
      setMessage('');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage('알림 권한이 허용되지 않았습니다.');
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const publicKeyRes = await fetch('/api/push/subscribe');
      const publicKeyData = await publicKeyRes.json();

      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKeyData.publicKey),
      });

      const saveRes = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!saveRes.ok) {
        const data = await saveRes.json();
        setMessage(data.error || '구독 저장 실패');
        setLoading(false);
        return;
      }

      setMessage('푸시 알림이 활성화되었습니다.');
      setLoading(false);
    } catch (error) {
      console.error(error);
      setMessage('푸시 설정 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>푸시 알림</div>
        <div className="small">이 브라우저는 푸시 알림을 지원하지 않거나 설정이 부족합니다.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 8 }}>푸시 알림</div>
      <button className="btn" onClick={enablePush} disabled={loading}>
        {loading ? '설정 중...' : '알림 허용 및 푸시 활성화'}
      </button>
      {message ? <div className="small" style={{ marginTop: 10 }}>{message}</div> : null}
    </div>
  );
}