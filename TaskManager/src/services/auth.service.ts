import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import crypto from 'crypto';

export async function register(email: string, password: string, name?: string) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw Object.assign(new Error('EmailAlreadyExists'), { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name });
  const token = signToken(user.id, user.email, user.name);
  return { user: { id: user.id, email: user.email, name: user.name }, token };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) {
    throw Object.assign(new Error('InvalidCredentials'), { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw Object.assign(new Error('InvalidCredentials'), { status: 401 });
  }
  const token = signToken(user.id, user.email, user.name);
  return { user: { id: user.id, email: user.email, name: user.name }, token };
}

function signToken(id: string, email: string, name?: string) {
  return sign(
    { sub: id, email, name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES as SignOptions['expiresIn'] }
  );
}

export async function requestPasswordReset(email: string) {
  const user = await User.findOne({ email });
  // Always respond success to prevent user enumeration
  if (!user) {
    return { ok: true };
  }
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();
  // In development, return the token so it can be used immediately without email
  const includeToken = process.env.NODE_ENV !== 'production';
  return includeToken ? { ok: true, token: rawToken } : { ok: true };
}

export async function resetPassword(rawToken: string, newPassword: string, name?: string) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const now = new Date();
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: now },
  });
  if (!user) {
    throw Object.assign(new Error('InvalidOrExpiredResetToken'), { status: 400 });
  }
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  if (typeof name === 'string' && name.trim().length > 0) {
    user.name = name.trim();
  }
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const token = signToken(user.id, user.email, user.name);
  return { user: { id: user.id, email: user.email, name: user.name }, token };
}