import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User';

// Configure multer storage to save under uploads/themes/<userId>-timestamp.ext
const uploadDir = path.join(process.cwd(), 'uploads', 'themes');
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: (error: any, destination: string) => void) => {
    try { fs.mkdirSync(uploadDir, { recursive: true }); } catch {}
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: (error: any, filename: string) => void) => {
    const userId = (req?.user?.id) || 'anonymous';
    const ext = path.extname(String(file.originalname)) || '.jpg';
    const name = `${userId}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

export async function me(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ error: 'NotFound' });
  const { id, email, name, themeBackgroundUrl } = { id: user._id?.toString(), email: user.email, name: user.name, themeBackgroundUrl: user.themeBackgroundUrl };
  res.json({ id, email, name, themeBackgroundUrl });
}

export async function setTheme(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const file = (req as any).file as { filename: string } | undefined;
  if (!file) return res.status(400).json({ error: 'ValidationError', message: 'image file is required' });
  const publicUrl = `/uploads/themes/${file.filename}`;
  const user = await User.findByIdAndUpdate(userId, { themeBackgroundUrl: publicUrl }, { new: true }).lean();
  if (!user) return res.status(404).json({ error: 'NotFound' });
  res.status(200).json({ ok: true, themeBackgroundUrl: publicUrl });
}