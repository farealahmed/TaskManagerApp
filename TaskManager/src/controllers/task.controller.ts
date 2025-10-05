import { Request, Response } from 'express';
import * as svc from '../services/task.service';

export async function create(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const task = await svc.createTask(userId, req.body);
  res.status(201).json(task);
}

export async function list(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const data = await svc.listTasks(userId, req.query);
  res.json(data);
}

export async function get(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const task = await svc.getTask(userId, req.params.id);
  if (!task) return res.status(404).json({ error: 'NotFound' });
  res.json(task);
}

export async function patch(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const task = await svc.updateTask(userId, req.params.id, req.body);
  if (!task) return res.status(404).json({ error: 'NotFound' });
  res.json(task);
}

export async function remove(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  await svc.deleteTask(userId, req.params.id);
  res.status(204).send();
}