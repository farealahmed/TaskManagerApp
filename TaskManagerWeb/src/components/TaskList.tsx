import type { Task } from '../types/task';

interface Props {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onUpdate: (id: string, patch: Partial<Task>) => Promise<void> | void;
  onSelect: (task: Task) => void;
}

export function TaskList({ tasks, onToggle, onDelete, onSelect }: Props) {
  if (!tasks.length) return <p>No tasks yet.</p>;
  return (
    <div>
      {tasks.map((t) => (
        <div key={t._id} className="card" onClick={() => onSelect(t)} style={{ cursor: 'pointer' }}>
          <h3>
            {t.title} {t.completed ? '✅' : ''}
          </h3>
          {t.description && <p>{t.description}</p>}
          <p style={{ color: '#94a3b8' }}>Priority: {t.priority} {t.dueDate ? `• Due: ${new Date(t.dueDate).toLocaleDateString()}` : ''}</p>
          <div className="controls">
            <button onClick={(e) => { e.stopPropagation(); onSelect(t); }}>Edit</button>
            <button className="secondary" onClick={(e) => { e.stopPropagation(); void onToggle(t._id, !t.completed); }}>
              {t.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button className="danger" onClick={(e) => { e.stopPropagation(); void onDelete(t._id); }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}