import { Task } from '../models/Task';

export async function createTask(userId: string, data: any) {
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  return Task.create({ ...data, user: userId });
}

export async function listTasks(userId: string, query: any) {
  const { search, priority, completed, dueBefore, dueAfter, page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;

  const filter: any = {};
  filter.user = userId;
  if (priority) filter.priority = priority;
  if (typeof completed === 'boolean') filter.completed = completed;
  if (dueBefore || dueAfter) filter.dueDate = {};
  if (dueBefore) filter.dueDate.$lte = new Date(dueBefore);
  if (dueAfter) filter.dueDate.$gte = new Date(dueAfter);
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const sortSpec: any = { [sort]: order === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Task.find(filter).sort(sortSpec).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  return { items, page, limit, total };
}

export async function getTask(userId: string, id: string) {
  return Task.findOne({ _id: id, user: userId });
}

export async function updateTask(userId: string, id: string, patch: any) {
  if (patch.dueDate) patch.dueDate = new Date(patch.dueDate);
  return Task.findOneAndUpdate({ _id: id, user: userId }, patch, { new: true });
}

export async function deleteTask(userId: string, id: string) {
  await Task.findOneAndDelete({ _id: id, user: userId });
}