export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO string
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskListResponse {
  items: Task[];
  page: number;
  limit: number;
  total: number;
}