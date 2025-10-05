import { useEffect, useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { setAuthToken } from './api/axios';
import { getMe, uploadThemeImage } from './services/userService';
import { AuthDialog } from './components/AuthDialog';
import type { Task } from './types/task';

export default function App() {
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem('token'); } catch { return null; }
  });
  const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';
  const uploadsOrigin = String(apiUrl).replace(/\/$/, '').replace(/\/api$/, '');

  // Decode user info from JWT so header shows name after refresh
  useEffect(() => {
    setAuthToken(token ?? undefined);
    if (token) {
      try {
        const [, payloadB64] = token.split('.') as [string, string, string?];
        if (payloadB64) {
          const normalized = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
          const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
          const json = atob(padded);
          const payload = JSON.parse(json) as { sub: string; email: string; name?: string };
          setUser({ id: payload.sub, email: payload.email, name: payload.name });
        }
      } catch {
        // ignore decode errors; user can still login to populate state
      }
      // Fetch profile to restore theme background
      (async () => {
        try {
          const me = await getMe();
          if (me?.themeBackgroundUrl) {
            applyBackground(me.themeBackgroundUrl);
          } else {
            clearBackground();
          }
        } catch {
          // ignore
        }
      })();
    } else {
      setUser(null);
      clearBackground();
    }
  }, [token]);

  const { tasks, loading, error, add, update, remove, setCompleted, refresh } = useTasks(!!token);
  const [authOpen, setAuthOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [uploadingTheme, setUploadingTheme] = useState(false);

  function logout() {
    setToken(null);
    setUser(null);
    clearBackground();
    // Ensure axios header + localStorage token are cleared immediately
    try { setAuthToken(undefined as any); } catch {}
  }

  function applyBackground(url: string) {
    const absolute = url.startsWith('http')
      ? url
      : `${uploadsOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
    document.body.style.backgroundImage = `url('${absolute}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.classList.add('has-theme-bg');
  }

  function clearBackground() {
    document.body.style.backgroundImage = '';
    document.body.classList.remove('has-theme-bg');
  }

  async function handleChangeTheme() {
    if (!token) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploadingTheme(true);
      try {
        const { themeBackgroundUrl } = await uploadThemeImage(file);
        applyBackground(themeBackgroundUrl);
      } catch (e) {
        console.error('Theme upload failed', e);
      } finally {
        setUploadingTheme(false);
      }
    };
    input.click();
  }

  // Auto-refetch when tab gains focus, only when authenticated
  useEffect(() => {
    if (!token) return;
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [token, refresh]);

  // Back arrow logs the user out when authenticated
  useEffect(() => {
    if (!token) return;
    try { history.pushState(null, '', location.href); } catch {}
    const onPop = () => {
      // Log out and overwrite history so forward doesn't restore login
      logout();
      try { history.pushState(null, '', location.href); } catch {}
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
    };
  }, [token]);

  return (
    <>
    <div className="container">
      <header>
        <h1>Task Manager</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {token ? (
            <>
              <span style={{ color: 'var(--muted)' }}>
                {user?.name ? `Signed in as ${user.name}` : 'Signed in'}
              </span>
              <button className="secondary" onClick={() => logout()}>Logout</button>
            </>
          ) : (
            <button onClick={() => setAuthOpen(true)}>Sign In</button>
          )}
        </div>
      </header>

      {token && (
        <section>
          <TaskForm
            editingTask={editingTask}
            onCreate={add}
            onUpdate={update}
            onCancel={() => setEditingTask(null)}
          />
        </section>
      )}

      <section>
        {loading && <p>Loading...</p>}
        {error && (
          <div className="card" style={{ background: '#200', borderColor: 'var(--danger)' }}>
            <p className="error" style={{ margin: 0 }}>{error}</p>
            {token && (
              <div style={{ marginTop: 8 }}>
                <button className="secondary" onClick={() => void refresh()}>Retry</button>
              </div>
            )}
          </div>
        )}
        {token ? (
          <TaskList
            tasks={tasks}
            onToggle={setCompleted}
            onDelete={remove}
            onUpdate={update}
            onSelect={(task) => setEditingTask(task)}
          />
        ) : (
          <p>Please login to see your tasks.</p>
        )}
      </section>
    </div>
    <AuthDialog
      open={authOpen}
      onClose={() => setAuthOpen(false)}
      onLoggedIn={(t, u) => { setToken(t); setUser(u); setAuthOpen(false); void refresh(); }}
    />
    {token && (
      <button
        onClick={() => void handleChangeTheme()}
        disabled={uploadingTheme}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 100,
        }}
      >{uploadingTheme ? 'Uploading…' : 'Change Theme'}</button>
    )}
    </>
  );
}