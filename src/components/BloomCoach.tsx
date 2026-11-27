'use client';

import { useState, useEffect } from 'react';
import { Send, X, RefreshCw } from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'model';
  text: string;
}

function buildSmartCoachReply(prompt: string, gender: 'male' | 'female'): string {
  const icon = gender === 'male' ? '🥷' : '🌸';
  const q = prompt.toLowerCase();

  if (q.includes('protein') || q.includes('calorie') || q.includes('gain') || q.includes('diet') || q.includes('eat')) {
    return `${icon} For clean calorie & protein gain:\n• Shakes: Banana + milk + peanut butter + oats (~650 kcal, ~25g protein).\n• Meals: Paneer, soya chunks, eggs, lentils/dal + rice or roti.\n• Dry fruits: Almonds, peanuts, cashews, dates & walnuts.\nTip: Aim for ~1.6–2.0g protein per kg body weight and a +250–350 kcal daily surplus.`;
  }

  if (q.includes('leg') || q.includes('squat') || q.includes('glute') || q.includes('calf')) {
    return `${icon} Strong leg session:\n1. Squats (bodyweight, goblet, or barbell): 4 sets × 8–12 reps\n2. Lunges or Step-Ups: 3 sets × 10 reps/leg\n3. Hip Thrusts / Glute Bridges: 3 sets × 12–15 reps\n4. Calf Raises: 4 sets × 15–20 reps\nRest 60–90s between sets and control the lowering phase.`;
  }

  if (q.includes('chest') || q.includes('arm') || q.includes('bicep') || q.includes('tricep') || q.includes('push')) {
    return `${icon} Upper-body focus:\n• Push-Ups / Bench or Incline Press: 4 sets × 8–12 reps\n• Rows / Lat Pulldowns: 4 sets × 10–12 reps\n• Lateral Raises: 3–4 sets × 12–15 reps\n• Curls & Tricep Extensions: 3 sets × 10–15 reps each.`;
  }

  if (q.includes('abs') || q.includes('belly') || q.includes('core') || q.includes('fat')) {
    return `${icon} Core & fat-loss routine:\n• Plank: 3 sets × 30–60s\n• Dead Bug or Leg Raises: 3 sets × 12 reps\n• Brisk walking / Zone 2 cardio: 20–30 mins daily\nRemember: spot fat reduction doesn't happen from crunches alone—pair core work with a slight calorie deficit and daily steps.`;
  }

  return `${icon} Got it! Here is a quick plan for "${prompt.trim()}":\n1. Warm up 5 minutes (light movement + mobility).\n2. Do 3–4 sets of 8–12 controlled reps with 60–90s rest.\n3. Drink water, hit your daily protein target, and sleep 7–8 hours.\nAsk me about any specific muscle, calorie/protein combo, or age group (0–90)!`;
}

export default function BloomCoach() {
  const [open, setOpen] = useState(false);
  const [coachGender, setCoachGender] = useState<'male' | 'female' | null>('female');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'model',
      text: '🌸 Hi! Ask me about workouts, muscle groups, or calorie & protein gain combos.',
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
        text: `${chosenIcon} Ready! Ask me any workout, muscle, or calorie & protein combo.`,
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
      if (res.ok) {
        const data = await res.json();
        if (data?.reply && typeof data.reply === 'string') {
          setMessages([...updated, { role: 'model', text: data.reply }]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to built-in coach below
    }

    const fallback = buildSmartCoachReply(userText, coachGender);
    setMessages([...updated, { role: 'model', text: fallback }]);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="matte-pill fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold text-[var(--text-primary)] shadow-xl transition hover:scale-105"
      >
        <span className="text-base">{icon}</span> Coach
      </button>

      {open && (
        <div className="matte-box fixed bottom-16 right-5 z-50 flex h-[450px] w-[340px] max-w-[92vw] flex-col overflow-hidden rounded-3xl shadow-2xl">
          {/* High-Contrast Header */}
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