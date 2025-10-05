import { api } from '../api/axios';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface ForgotResponse {
  ok: boolean;
  token?: string; // Provided in non-production for convenience
}

export async function register(email: string, password: string, name?: string): Promise<AuthResponse> {
  const { data } = await api.post('/auth/register', { email, password, name });
  return data as AuthResponse;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', { email, password });
  return data as AuthResponse;
}

export async function requestPasswordReset(email: string): Promise<ForgotResponse> {
  const { data } = await api.post('/auth/forgot', { email });
  return data as ForgotResponse;
}

export async function resetPassword(token: string, password: string, name?: string): Promise<AuthResponse> {
  const body: any = { token, password };
  if (name && name.trim().length > 0) body.name = name.trim();
  const { data } = await api.post('/auth/reset', body);
  return data as AuthResponse;
}