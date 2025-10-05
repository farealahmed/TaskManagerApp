import { useEffect, useMemo, useState } from 'react';
import { login, register, requestPasswordReset, resetPassword } from '../services/authService';
import { setAuthToken } from '../api/axios';

type Mode = 'login' | 'register' | 'forgot' | 'reset';

interface Props {
  open: boolean;
  onClose: () => void;
  onLoggedIn: (token: string, user: { id: string; email: string; name?: string }) => void;
}

export function AuthDialog({ open, onClose, onLoggedIn }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setMode('login');
      setEmail('');
      setPassword('');
      setName('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const isEmailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const isPasswordValid = useMemo(() => password.length >= 8, [password]);
  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (mode === 'login' || mode === 'register') {
      if (!isEmailValid || !isPasswordValid) return false;
    }
    if (mode === 'forgot') {
      if (!isEmailValid) return false;
    }
    if (mode === 'reset') {
      if (!isPasswordValid) return false;
    }
    return true;
  }, [loading, isEmailValid, isPasswordValid, mode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        const res = await login(email, password);
        setAuthToken(res.token);
        onLoggedIn(res.token, res.user);
        onClose();
      } else if (mode === 'register') {
        const res = await register(email, password, name || undefined);
        setAuthToken(res.token);
        onLoggedIn(res.token, res.user);
        onClose();
      } else if (mode === 'forgot') {
        const res = await requestPasswordReset(email);
        setDevToken(res.token ?? null);
        // Switch to reset mode so user can paste token and set new password
        setMode('reset');
      } else if (mode === 'reset') {
        const tokenToUse = devToken ?? prompt('Enter the reset token provided via email') ?? '';
        if (!tokenToUse) throw new Error('Reset token is required');
        const res = await resetPassword(tokenToUse, password, name || undefined);
        setAuthToken(res.token);
        onLoggedIn(res.token, res.user);
        onClose();
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
              {mode === 'login' && 'Sign In'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset' && 'Set New Password'}
            </h3>
            <button className="secondary" onClick={onClose}>Close</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              className={mode === 'login' ? '' : 'secondary'}
              onClick={() => setMode('login')}
            >Sign In</button>
            <button
              type="button"
              className={mode === 'register' ? '' : 'secondary'}
              onClick={() => setMode('register')}
            >Register</button>
            <button
              type="button"
              className={mode === 'forgot' ? '' : 'secondary'}
              onClick={() => setMode('forgot')}
            >Forgot</button>
          </div>
          {error && (
            <div className="card" style={{ background: '#200', borderColor: 'var(--danger)', marginTop: 8 }}>
              <span className="error">{error}</span>
            </div>
          )}
          <form onSubmit={onSubmit} style={{ marginTop: 8 }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {!isEmailValid && email && <small className="error">Enter a valid email address</small>}

            {(mode === 'register' || mode === 'reset') && (
              <>
                <label>Name (optional)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </>
            )}

            {mode !== 'forgot' && (
              <>
                <label>Password</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'login' ? 'Your password' : mode === 'reset' ? 'New password' : 'At least 8 characters'}
                  />
                  <button type="button" className="secondary" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {!isPasswordValid && password && <small className="error">Password must be at least 8 characters</small>}
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <button type="submit" disabled={!canSubmit}>
                {loading ? 'Please wait…' :
                  mode === 'login' ? 'Continue' :
                  mode === 'register' ? 'Create Account' :
                  mode === 'forgot' ? 'Send Reset Link' :
                  'Set Password'}
              </button>
              {mode === 'login' && (
                <a href="#" style={{ color: 'var(--muted)' }} onClick={(e) => { e.preventDefault(); setMode('forgot'); }}>Forgot password?</a>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}