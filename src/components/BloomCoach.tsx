'use client';

import { useState, useEffect } from 'react';
import { Send, X, RefreshCw } from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'model';
  text: string;
}

export default function BloomCoach() {
  const [open, setOpen] = useState(false);
  const [coachGender, setCoachGender] = useState<'male' | 'female' | null>('female');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'model',
      text: '🌸 Connected to Gemini! Ask me about workouts, diet, or protein.',
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('bloom_coach_gender');
    if (saved === 'male' || saved === 'female') {
      setCoachGender(saved);
    }
  }, []);

  const icon = coachGender === 'male' ? '🥷' : '🌸';
  const isMale = coachGender === 'male';

  const selectGender = (g: 'male' | 'female') => {
    setCoachGender(g);
    localStorage.setItem('bloom_coach_gender', g);
    const chosenIcon = g === 'male' ? '🥷' : '🌸';
    setMessages([
      {
        role: 'model',
        text: `${chosenIcon} Ready! What workout or nutrition question can I help with?`,
      },
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !coachGender || loading) return;
    const userText = input.trim();
    const updated = [...messages, { role: 'user' as const, text: userText }];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          coachGender,
          history: updated,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && typeof data?.reply === 'string' && data.reply.trim()) {
        setMessages([...updated, { role: 'model', text: data.reply.trim() }]);
      } else {
        const errText =
          typeof data?.error === 'string' && data.error.trim()
            ? data.error.trim()
            : `Could not reach Gemini (${res.status}). Check GEMINI_API_KEY.`;
        setMessages([...updated, { role: 'model', text: `⚠️ ${errText}` }]);
      }
    } catch {
      setMessages([
        ...updated,
        { role: 'model', text: '⚠️ Network error while calling /api/coach.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="matte-pill fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold text-[var(--text-primary)] shadow-xl transition hover:scale-105"
      >
        <span className="text-base">{icon}</span> Coach
      </button>

      {open && (
        <div className="matte-box fixed bottom-16 right-5 z-50 flex h-[450px] w-[340px] max-w-[92vw] flex-col overflow-hidden rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#12121a] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-extrabold text-white">{icon} Coach</span>
            </div>
            <div className="flex items-center gap-1">
              {coachGender && (
                <button
                  type="button"
                  onClick={() => setCoachGender(null)}
                  title="Switch Coach"
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {!coachGender ? (
            <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
              <span className="text-3xl">🥷 🌸</span>
              <h3 className="mt-3 text-base font-extrabold text-[var(--text-primary)]">
                Choose Coach
              </h3>
              <div className="mt-5 grid w-full grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => selectGender('male')}
                  className="matte-box-soft rounded-2xl p-3.5 text-xs font-extrabold text-sky-400"
                >
                  🥷 Male
                </button>
                <button
                  type="button"
                  onClick={() => selectGender('female')}
                  className="matte-box-soft rounded-2xl p-3.5 text-xs font-extrabold text-pink-400"
                >
                  🌸 Female
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-2.5 overflow-y-auto p-3.5 text-xs">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      m.role === 'user'
                        ? 'ml-auto bg-gradient-to-r from-sky-500 to-indigo-500 font-semibold text-white'
                        : 'matte-box-soft text-[var(--text-primary)]'
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {loading && (
                  <div className="matte-box-soft w-fit rounded-2xl px-3 py-1.5 text-xs text-sky-400">
                    {icon} thinking...
                  </div>
                )}
              </div>

              <div className="flex gap-2 border-t border-white/10 bg-[var(--bg-input)] p-2.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask workout, diet, protein..."
                  className="flex-1 rounded-xl border border-sky-500/25 bg-[var(--bg-input)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={loading}
                  className={`rounded-xl p-2 text-white transition ${
                    isMale ? 'bg-sky-500 hover:bg-sky-400' : 'bg-pink-500 hover:bg-pink-400'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}