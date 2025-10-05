import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
  timeout: 10000,
});

export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try { localStorage.setItem('token', token); } catch {}
  } else {
    delete api.defaults.headers.common['Authorization'];
    try { localStorage.removeItem('token'); } catch {}
  }
}

// Initialize from storage on load
try {
  const stored = localStorage.getItem('token');
  if (stored) setAuthToken(stored);
} catch {}

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);