import { api } from '../api/axios';

export interface MeResponse {
  id: string;
  email: string;
  name?: string;
  themeBackgroundUrl?: string;
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get('/user/me');
  return data as MeResponse;
}

export async function uploadThemeImage(file: File): Promise<{ themeBackgroundUrl: string }> {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post('/user/theme', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data as { themeBackgroundUrl: string };
}