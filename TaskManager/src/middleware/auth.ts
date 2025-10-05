import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const requireAuth: RequestHandler = (req, res, next) => {
  const hdr = req.headers.authorization;
  if (!hdr || !hdr.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = hdr.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string; name?: string };
    (req as any).user = { id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};