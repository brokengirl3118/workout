'use client';

import { useState, useEffect } from 'react';
import { Send, X, RefreshCw } from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'model';
  text: string;
}

export default function BloomCoach() {
  const [open, setOpen] = useState(false);
  const [coachGender, setCoachGender] = useState<'male' | 'female' | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bloom_coach_gender');
    if (saved === 'male' || saved === 'female') setCoachGender(saved);
  }, []);

  const selectGender = (g: 'male' | 'female') => {
    setCoachGender(g);
    localStorage.setItem('bloom_coach_gender', g);
    setMessages([
      {
        role: 'model',
        text: `Hi! I'm 🌸 (${g === 'male' ? 'Male' : 'Female'} AI Coach). Ask me any workout name, form guide, or routine for any age from 0 to 90!`,
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
        body: JSON.stringify({ message: userText, coachGender, history: updated }),
      });
      const data = await res.json();
      setMessages([...updated, { role: 'model', text: data.reply }]);
    } catch {
      setMessages([...updated, { role: 'model', text: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/30 transition hover:scale-105"
      >
        <span className="text-lg">🌸</span> AI Coach
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[520px] w-[360px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌸</span>
              <div>
                <p className="text-sm font-bold text-white">🌸 Workout AI</p>
                <p className="text-xs text-zinc-400">
                  {coachGender ? `${coachGender === 'male' ? 'Male' : 'Female'} Coach` : 'Select Version'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {coachGender && (
                <button
                  onClick={() => setCoachGender(null)}
                  title="Switch Male/Female"
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Step 1: Male / Female Selector */}
          {!coachGender ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <span className="text-4xl">🌸</span>
              <h3 className="mt-3 text-lg font-bold text-white">Choose Your 🌸 AI Coach</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Select Male or Female version to start your global workout guide.
              </p>
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <button
                  onClick={() => selectGender('male')}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-sm font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10"
                >
                  💪 Male AI
                </button>
                <button
                  onClick={() => selectGender('female')}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-sm font-bold text-white transition hover:border-pink-500 hover:bg-pink-500/10"
                >
                  🌸 Female AI
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 ${
                      m.role === 'user'
                        ? 'ml-auto bg-emerald-500 text-black font-medium'
                        : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {loading && (
                  <div className="w-fit rounded-xl bg-zinc-900 px-3.5 py-2 text-xs text-zinc-400">
                    🌸 is thinking...
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2 border-t border-zinc-800 p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask any exercise or plan..."
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-pink-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="rounded-xl bg-pink-500 p-2.5 text-white hover:bg-pink-400 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}