import { Request, Response } from 'express';
import * as svc from '../services/auth.service';

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'ValidationError', details: ['email and password are required'] });
  const result = await svc.register(String(email), String(password), name ? String(name) : undefined);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'ValidationError', details: ['email and password are required'] });
  const result = await svc.login(String(email), String(password));
  res.json(result);
}

export async function forgot(req: Request, res: Response) {
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: 'ValidationError', details: ['email is required'] });
  const result = await svc.requestPasswordReset(String(email));
  res.json(result);
}

export async function reset(req: Request, res: Response) {
  const { token, password, name } = req.body ?? {};
  if (!token || !password) return res.status(400).json({ error: 'ValidationError', details: ['token and password are required'] });
  const result = await svc.resetPassword(String(token), String(password), name ? String(name) : undefined);
  res.json(result);
}