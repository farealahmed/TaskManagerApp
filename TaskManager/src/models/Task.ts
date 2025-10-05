import { Schema, model, Types } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';

export interface TaskDoc {
  user: Types.ObjectId;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: Date;
  completed: boolean;
}

const TaskSchema = new Schema<TaskDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TaskSchema.index({ user: 1, priority: 1 });
TaskSchema.index({ user: 1, dueDate: 1 });
TaskSchema.index({ user: 1, completed: 1 });
TaskSchema.index({ title: 'text', description: 'text' });

export const Task = model<TaskDoc>('Task', TaskSchema);