'use client';

import { useState, useEffect } from 'react';
import { Bell, User, LogIn, UserPlus, LogOut, X, CheckCheck, Sparkles } from 'lucide-react';

export interface AlertEntry {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
}

export interface UserProfileData {
  username: string;
  email: string;
  xp: number;
  streak: number;
  water: number;
  favorites: string[];
  theme: 'dark' | 'light';
  alerts: AlertEntry[];
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: string | null;
  onLoginSuccess: (profile: UserProfileData) => void;
  onLogout: () => void;
}

const USERS_STORAGE_KEY = 'flower_users_db_v1';

export function loadUsersDb(): Record<string, UserProfileData & { password: string }> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveUserProfile(profile: UserProfileData) {
  if (typeof window === 'undefined') return;
  const db = loadUsersDb();
  const key = profile.username.toLowerCase();
  if (db[key]) {
    db[key] = { ...db[key], ...profile };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(db));
  }
  localStorage.setItem('flower_active_user', profile.username);
}

export function AuthModal({
  open,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setPassword('');
  }, [open, mode]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanName = username.trim();
    if (!cleanName || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    const db = loadUsersDb();
    const key = cleanName.toLowerCase();

    if (mode === 'signup') {
      if (db[key]) {
        setError('This username already exists. Switch to Login.');
        return;
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newProfile: UserProfileData & { password: string } = {
        username: cleanName,
        email: email.trim() || `${key}@flower.local`,
        password: password,
        xp: 0,
        streak: 1,
        water: 0,
        favorites: [],
        theme: 'dark',
        alerts: [
          {
            id: `${Date.now()}-welcome`,
            title: 'Account Created',
            detail: `Welcome ${cleanName}! Your progress and status are now saved to your account.`,
            time: nowTime,
            read: false,
          },
          {
            id: `${Date.now()}-update`,
            title: 'App Update',
            detail: 'Exercises, 99+ tools, water log, and live alerts are active.',
            time: nowTime,
            read: false,
          },
        ],
      };

      db[key] = newProfile;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(db));
      localStorage.setItem('flower_active_user', cleanName);
      const { password: _pw, ...safeProfile } = newProfile;
      onLoginSuccess(safeProfile);
      onClose();
    } else {
      const existing = db[key];
      if (!existing) {
        setError('Account not found. Click "Create Account" to register.');
        return;
      }
      if (existing.password !== password) {
        setError('Incorrect password.');
        return;
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const { password: _pw, ...safeProfile } = existing;
      const updatedAlerts: AlertEntry[] = [
        {
          id: `${Date.now()}-login`,
          title: 'Signed In',
          detail: `Welcome back, ${safeProfile.username}! All saved status restored.`,
          time: nowTime,
          read: false,
        },
        ...(safeProfile.alerts || []),
      ].slice(0, 30);

      const restored: UserProfileData = { ...safeProfile, alerts: updatedAlerts };
      saveUserProfile(restored);
      onLoginSuccess(restored);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="matte-box relative w-full max-w-md rounded-3xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl bg-sky-500/10 p-1.5 text-[var(--text-muted)] hover:bg-sky-500/20 hover:text-[var(--text-primary)]"
        >
          <X className="h-4 w-4" />
        </button>

        {currentUser ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400">
              <User className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{currentUser}</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Your XP, streak, water count, saved moves, and alerts are automatically saved under this account.
            </p>
            <div className="flex justify-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-400"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
              <button
                onClick={onClose}
                className="matte-pill rounded-xl px-4 py-2.5 text-xs font-bold text-[var(--text-primary)]"
              >
                Keep Exploring
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2 rounded-2xl bg-sky-500/10 p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold transition ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" /> Login
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold transition ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" /> Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-[var(--text-muted)]">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name or handle"
                  className="mt-1 w-full rounded-xl border border-sky-500/25 bg-[var(--bg-input)] px-3.5 py-2.5 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-sky-400"
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="text-[11px] font-bold uppercase text-[var(--text-muted)]">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-xl border border-sky-500/25 bg-[var(--bg-input)] px-3.5 py-2.5 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-sky-400"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase text-[var(--text-muted)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-sky-500/25 bg-[var(--bg-input)] px-3.5 py-2.5 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-sky-400"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 py-3 text-xs font-extrabold text-white shadow-md transition hover:brightness-110"
              >
                {mode === 'login' ? 'Login & Restore Status' : 'Create Account & Save Status'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

interface NotificationBellProps {
  alerts: AlertEntry[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export function NotificationBell({
  alerts,
  onMarkAllRead,
  onClearAll,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        className="matte-pill relative flex items-center justify-center rounded-xl p-2 text-sky-400 transition hover:scale-105"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-extrabold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="matte-box fixed right-4 top-16 z-50 flex max-h-[75vh] w-80 max-w-[92vw] flex-col overflow-hidden rounded-3xl shadow-2xl sm:absolute sm:right-0 sm:top-12">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--text-primary)]">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Activity &amp; Updates
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:underline"
                >
                  <CheckCheck className="h-3 w-3" /> Read all
                </button>
              )}
              <button
                onClick={onClearAll}
                className="text-[10px] font-bold text-rose-400 hover:underline"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {alerts.length === 0 ? (
              <p className="py-8 text-center text-xs text-[var(--text-muted)]">
                No notifications yet. Actions you complete and app updates appear here.
              </p>
            ) : (
              alerts.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-3 text-xs ${
                    item.read
                      ? 'border-white/5 bg-sky-500/[0.03] opacity-80'
                      : 'border-pink-400/35 bg-pink-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[var(--text-primary)]">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">{item.time}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">
                    {item.detail}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}