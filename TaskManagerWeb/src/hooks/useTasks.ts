import { useEffect, useState, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, toggleComplete } from '../services/taskService';
import type { Task } from '../types/task';

export function useTasks(enabled: boolean = true) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data.items);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [refresh, enabled]);

  const add = async (input: Partial<Task>) => {
    const newTask = await createTask(input);
    setTasks((prev) => [newTask, ...prev]);
  };

  const update = async (id: string, patch: Partial<Task>) => {
    const updated = await updateTask(id, patch);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const remove = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  const setCompleted = async (id: string, completed: boolean) => {
    const updated = await toggleComplete(id, completed);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  return { tasks, loading, error, refresh, add, update, remove, setCompleted };
}