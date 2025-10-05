import { useState } from 'react';
import { login, register } from '../services/authService';
import { setAuthToken } from '../api/axios';

interface Props {
  onLoggedIn: (token: string, user: { id: string; email: string; name?: string }) => void;
  onLogout: () => void;
  user?: { id: string; email: string; name?: string } | null;
}

export function AuthBar({ onLoggedIn, onLogout, user }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = mode === 'login' ? await login(email, password) : await register(email, password, name || undefined);
      setAuthToken(res.token);
      onLoggedIn(res.token, res.user);
      setEmail('');
      setPassword('');
      setName('');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Auth failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: 'var(--muted)' }}>Signed in as {user.email}{user.name ? ` • ${user.name}` : ''}</span>
        <button className="secondary" onClick={() => { setAuthToken(undefined); onLogout(); }}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
      <select value={mode} onChange={(e) => setMode(e.target.value as 'login' | 'register')}>
        <option value="login">Login</option>
        <option value="register">Register</option>
      </select>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {mode === 'register' && <input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />}
      <button type="submit" disabled={loading}>{mode === 'login' ? 'Login' : 'Register'}</button>
      {error && <span className="error">{error}</span>}
    </form>
  );
}