import { useEffect, useState } from 'react';
import type { Task, Priority } from '../types/task';

interface Props {
  editingTask?: Task | null;
  onCreate: (input: Partial<Task>) => Promise<void> | void;
  onUpdate?: (id: string, patch: Partial<Task>) => Promise<void> | void;
  onCancel?: () => void;
}

export function TaskForm({ editingTask, onCreate, onUpdate, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  // When an editing task is provided, prefill fields
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title ?? '');
      setDescription(editingTask.description ?? '');
      setPriority(editingTask.priority ?? 'medium');
      const iso = editingTask.dueDate;
      setDueDate(iso ? new Date(iso).toISOString().slice(0, 10) : '');
    } else {
      // Reset to default create state
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  }, [editingTask]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      // Only set completed on create; editing should not override this flag
      ...(editingTask ? {} : { completed: false }),
    };
    if (!payload.title) return;
    if (editingTask && onUpdate) {
      await onUpdate(editingTask._id, payload);
      // Clear edit state in parent
      onCancel && onCancel();
    } else {
      await onCreate(payload);
    }
    // Reset local form fields to create defaults
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
  };

  return (
    <form onSubmit={submit} className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{editingTask ? 'Edit Task' : 'Create Task'}</h3>
        {editingTask && (
          <button type="button" className="secondary" onClick={() => onCancel && onCancel()}>Cancel</button>
        )}
      </div>
      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
      <label>Description</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
      <div className="row">
        <div>
          <label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label>Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div style={{ alignSelf: 'end' }}>
          <button type="submit">{editingTask ? 'Update' : 'Add'}</button>
        </div>
      </div>
    </form>
  );
}