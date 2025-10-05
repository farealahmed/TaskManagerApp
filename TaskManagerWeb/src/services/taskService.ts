import { api } from '../api/axios';
import type { Task, TaskListResponse } from '../types/task';

export async function getTasks(params: Record<string, any> = {}): Promise<TaskListResponse> {
  const { data } = await api.get('/tasks', { params });
  return data as TaskListResponse;
}

export async function getTask(id: string): Promise<Task> {
  const { data } = await api.get(`/tasks/${id}`);
  return data as Task;
}

export async function createTask(input: Partial<Task>): Promise<Task> {
  const { data } = await api.post('/tasks', input);
  return data as Task;
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task> {
  const { data } = await api.patch(`/tasks/${id}`, patch);
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function toggleComplete(id: string, completed: boolean): Promise<Task> {
  return updateTask(id, { completed });
}