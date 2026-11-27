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

  const icon = coachGender === 'male' ? '🥷' : '🌸';
  const isMale = coachGender === 'male';

  const selectGender = (g: 'male' | 'female') => {
    setCoachGender(g);
    localStorage.setItem('bloom_coach_gender', g);
    const chosenIcon = g === 'male' ? '🥷' : '🌸';
    setMessages([
      {
        role: 'model',
        text: `Hi! I'm ${chosenIcon} (${g === 'male' ? 'Male Ninja' : 'Female'} AI Coach). Ask me any workout name, form guide, or routine for any age from 0 to 90!`,
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
        className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 ${
          isMale
            ? 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-300/50'
            : 'bg-gradient-to-r from-pink-400 to-rose-500 shadow-pink-300/50'
        }`}
      >
        <span className="text-lg">{icon}</span> AI Coach
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[520px] w-[360px] max-w-[92vw] flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl shadow-sky-200/60">
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-3.5 text-white ${
              isMale
                ? 'bg-gradient-to-r from-sky-500 to-blue-600'
                : 'bg-gradient-to-r from-pink-400 to-rose-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-sm font-extrabold">{icon} Workout AI</p>
                <p className="text-xs text-white/85">
                  {coachGender
                    ? `${coachGender === 'male' ? 'Male Ninja' : 'Female'} Coach`
                    : 'Select Version'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {coachGender && (
                <button
                  onClick={() => setCoachGender(null)}
                  title="Switch Male/Female"
                  className="rounded-lg p-1.5 text-white/85 hover:bg-white/20 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/85 hover:bg-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Step 1: Male / Female Selector */}
          {!coachGender ? (
            <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-sky-50/60 to-white p-6 text-center">
              <span className="text-4xl">🥷 🌸</span>
              <h3 className="mt-3 text-lg font-extrabold text-slate-800">Choose Your AI Coach</h3>
              <p className="mt-1 text-xs text-slate-500">
                Select Male Ninja or Female version to start your global workout guide.
              </p>
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <button
                  onClick={() => selectGender('male')}
                  className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-bold text-sky-800 transition hover:border-sky-500 hover:bg-sky-100"
                >
                  🥷 Male AI
                </button>
                <button
                  onClick={() => selectGender('female')}
                  className="rounded-2xl border border-pink-200 bg-pink-50 p-4 text-sm font-bold text-pink-700 transition hover:border-pink-400 hover:bg-pink-100"
                >
                  🌸 Female AI
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto bg-sky-50/30 p-4 text-sm">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      m.role === 'user'
                        ? 'ml-auto bg-gradient-to-r from-sky-500 to-blue-600 font-medium text-white'
                        : 'border border-sky-100 bg-white text-slate-700'
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {loading && (
                  <div className="w-fit rounded-2xl border border-sky-100 bg-white px-3.5 py-2 text-xs font-medium text-sky-600">
                    {icon} is thinking...
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2 border-t border-sky-100 bg-white p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask any exercise or plan..."
                  className="flex-1 rounded-xl border border-sky-200 bg-sky-50/40 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:bg-white"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className={`rounded-xl p-2.5 text-white transition disabled:opacity-50 ${
                    isMale
                      ? 'bg-sky-500 hover:bg-sky-600'
                      : 'bg-pink-500 hover:bg-pink-600'
                  }`}
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