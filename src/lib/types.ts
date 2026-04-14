export type Task = {
  id: number;
  title: string;
  notifyTime: string;
  completed: number;
  createdAt: string;
  updatedAt: string;
};

export type PushSubscriptionRow = {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
};

export type NotificationLog = {
  id: number;
  taskId: number;
  dateKey: string;
  stage: 'initial' | 'reminder';
  sentAt: string;
};