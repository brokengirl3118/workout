'use client';

import { useState } from 'react';
import { Bell, LogOut, X, CheckCheck, Sparkles, CloudCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface AlertEntry {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
}

export interface ChatMsg {
  role: 'user' | 'model';
  text: string;
  time?: string;
}

export interface ActivityEntry {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface CloudUserProgress {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  xp: number;
  streak: number;
  last_visit: string;
  water: number;
  favorites: string[];
  theme: 'dark' | 'light';
  coach_gender: 'male' | 'female';
  alerts: AlertEntry[];
  chat_history: ChatMsg[];
  activity_log: ActivityEntry[];
}

export async function signInWithGoogleOnly() {
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOutGoogle() {
  await supabase.auth.signOut();
}

export async function loadCloudProgress(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<CloudUserProgress> {
  const today = new Date().toISOString().slice(0, 10);
  const fullName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email?.split('@')[0] ||
    'Member';
  const avatarUrl = (user.user_metadata?.avatar_url as string) || '';

  const { data } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (data) {
    let nextStreak = Number(data.streak || 1);
    const lastVisit = data.last_visit as string | null;

    if (lastVisit && lastVisit !== today) {
      const prev = new Date(lastVisit);
      const now = new Date(today);
      const diffDays = Math.round(
        (now.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      nextStreak = diffDays === 1 ? nextStreak + 1 : 1;
    }

    const restored: CloudUserProgress = {
      user_id: user.id,
      email: user.email || data.email || '',
      full_name: fullName,
      avatar_url: avatarUrl,
      xp: Number(data.xp || 0),
      streak: nextStreak,
      last_visit: today,
      water: Number(data.water || 0),
      favorites: Array.isArray(data.favorites) ? data.favorites : [],
      theme: data.theme === 'light' ? 'light' : 'dark',
      coach_gender: data.coach_gender === 'male' ? 'male' : 'female',
      alerts: Array.isArray(data.alerts) ? data.alerts : [],
      chat_history: Array.isArray(data.chat_history) ? data.chat_history : [],
      activity_log: Array.isArray(data.activity_log) ? data.activity_log : [],
    };

    if (lastVisit !== today) {
      await saveCloudProgress(restored);
    }

    return restored;
  }

  const initial: CloudUserProgress = {
    user_id: user.id,
    email: user.email || '',
    full_name: fullName,
    avatar_url: avatarUrl,
    xp: 0,
    streak: 1,
    last_visit: today,
    water: 0,
    favorites: [],
    theme: 'dark',
    coach_gender: 'female',
    alerts: [
      {
        id: `${Date.now()}-welcome`,
        title: 'Google Account Connected',
        detail: `Welcome ${fullName}! Every activity, XP, water log, and AI chat is saved permanently.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
    ],
    chat_history: [
      {
        role: 'model',
        text: `🌸 Hi ${fullName}! All our chats and your daily progress are permanently saved to your Google account.`,
      },
    ],
    activity_log: [
      {
        id: `${Date.now()}-init`,
        action: 'Account Linked',
        detail: 'Signed in with Google',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await saveCloudProgress(initial);
  return initial;
}

export async function saveCloudProgress(progress: CloudUserProgress) {
  await supabase.from('user_progress').upsert(
    {
      ...progress,
      alerts: progress.alerts.slice(0, 40),
      chat_history: progress.chat_history.slice(-100),
      activity_log: progress.activity_log.slice(0, 150),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  user: { email: string; name: string; avatar?: string } | null;
  syncing: boolean;
  onLogout: () => void;
}

export function AuthModal({ open, onClose, user, syncing, onLogout }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    setErr(null);
    setLoading(true);
    try {
      await signInWithGoogleOnly();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Google sign-in failed.');
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="matte-box relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl bg-sky-500/15 p-1.5 text-[var(--text-primary)] hover:bg-sky-500/25"
        >
          <X className="h-4 w-4" />
        </button>

        {user ? (
          <div className="space-y-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="mx-auto h-14 w-14 rounded-full border-2 border-sky-400 object-cover"
              />
            ) : (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/20 text-2xl">
                🌸
              </div>
            )}

            <div>
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">{user.name}</h2>
              <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
            </div>

            <div className="matte-box-soft flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold text-emerald-400">
              <CloudCheck className="h-4 w-4" />
              {syncing ? 'Saving to cloud...' : 'All progress & AI chats saved permanently'}
            </div>

            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-2.5 text-xs font-bold text-white hover:bg-rose-400"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/15 text-3xl">
              🌸
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                Continue with Google
              </h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Sign in with Google to permanently save all workouts, XP, water, alerts, and AI
                coach chats across every device.
              </p>
            </div>

            {err && (
              <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-400">
                {err}
              </p>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 py-3 text-xs font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-slate-900">
                G
              </span>
              {loading ? 'Opening Google...' : 'Sign in with Google'}
            </button>
          </div>
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
        type="button"
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
                  type="button"
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:underline"
                >
                  <CheckCheck className="h-3 w-3" /> Read all
                </button>
              )}
              <button
                type="button"
                onClick={onClearAll}
                className="text-[10px] font-bold text-rose-400 hover:underline"
              >
                Clear
              </button>
              <button
                type="button"
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