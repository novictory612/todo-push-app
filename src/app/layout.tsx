import type { Metadata } from 'next';
import './globals.css';
import { startScheduler } from '@/lib/scheduler';

startScheduler();

export const metadata: Metadata = {
  title: '할 일 알림',
  description: '개인용 할 일 알림 웹앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}