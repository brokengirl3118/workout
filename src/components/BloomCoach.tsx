'use client';

import { useState, useEffect } from 'react';
import { Send, X, RefreshCw } from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'model';
  text: string;
}

function isQuotaOrApiError(text: unknown): boolean {
  if (typeof text !== 'string' || !text.trim()) return true;
  const lower = text.toLowerCase();
  return (
    lower.includes('429') ||
    lower.includes('quota') ||
    lower.includes('exceeded') ||
    lower.includes('rate-limit') ||
    lower.includes('generativelanguage')
  );
}

function buildSmartCoachReply(prompt: string, gender: 'male' | 'female'): string {
  const icon = gender === 'male' ? '🥷' : '🌸';
  const raw = prompt.trim();
  const q = raw.toLowerCase();

  if (/^(hi|hello|hey|hola|namaste|yo)\b/.test(q)) {
    return `${icon} Hello! I'm always ready with unlimited tips.\nAsk me for:\n• Calorie & protein gain combos\n• Full-body, chest, back, leg, or arm workouts\n• Fat loss, stretching, sleep, or age-safe moves (0–90)`;
  }

  if (q.includes('protein') || q.includes('calorie') || q.includes('gain') || q.includes('diet') || q.includes('eat') || q.includes('food')) {
    return `${icon} Unlimited Calorie & Protein Gain Guide:\n• Gain Shake (~680 kcal, 26g protein): 2 bananas + 1 glass milk + 2 tbsp peanut butter + 50g oats.\n• Veg Power Bowl (~650 kcal, 34g protein): 150g paneer or 60g soya chunks + rice/roti + curd.\n• Dry Fruits (~430 kcal, 11g protein): Almonds, peanuts, cashews, dates & walnuts.\n• Rule: Add ~250–350 kcal above maintenance and eat ~1.6–2.0g protein per kg body weight daily.`;
  }

  if (q.includes('leg') || q.includes('squat') || q.includes('glute') || q.includes('calf') || q.includes('thigh')) {
    return `${icon} Leg & Glute Routine:\n1. Squats (bodyweight, goblet, or barbell): 4 sets × 8–12 reps\n2. Reverse Lunges or Step-Ups: 3 sets × 10 reps/leg\n3. Glute Bridge or Hip Thrust: 3 sets × 12–15 reps\n4. Standing Calf Raises: 4 sets × 15–20 reps\nRest 60–90s between sets and control the lowering phase.`;
  }

  if (q.includes('chest') || q.includes('push') || q.includes('bench')) {
    return `${icon} Chest & Push Routine:\n1. Push-Ups or Bench Press: 4 sets × 8–12 reps\n2. Incline Push-Ups or Incline Press: 3 sets × 10–12 reps\n3. Chest Fly or Squeeze Press: 3 sets × 12–15 reps\n4. Tricep Dips or Extensions: 3 sets × 10–15 reps\nKeep shoulder blades slightly pulled back and breathe smoothly.`;
  }

  if (q.includes('back') || q.includes('pull') || q.includes('row') || q.includes('lat')) {
    return `${icon} Back & Pull Routine:\n1. Rows (dumbbell, barbell, cable, or inverted): 4 sets × 8–12 reps\n2. Lat Pulldowns or Pull-Ups/Assisted Pulls: 3–4 sets × 8–12 reps\n3. Rear Delt Fly or Face Pulls: 3 sets × 15 reps\n4. Bicep Curls: 3 sets × 10–15 reps`;
  }

  if (q.includes('arm') || q.includes('bicep') || q.includes('tricep') || q.includes('shoulder')) {
    return `${icon} Shoulders & Arms Routine:\n1. Overhead Press: 3–4 sets × 8–12 reps\n2. Lateral Raises: 4 sets × 12–15 reps\n3. Bicep Curls (hammer or standard): 3 sets × 10–12 reps\n4. Overhead Tricep Extension or Pushdown: 3 sets × 10–12 reps`;
  }

  if (q.includes('abs') || q.includes('belly') || q.includes('core') || q.includes('fat') || q.includes('weight loss') || q.includes('cut')) {
    return `${icon} Core & Lean Fat-Loss Plan:\n• Plank: 3 sets × 30–60s\n• Dead Bug or Mountain Climbers: 3 sets × 12–20 reps\n• Daily brisk walk / Zone 2 cardio: 20–35 mins\n• Nutrition: Slight calorie deficit (~300–400 kcal) + high protein + water.`;
  }

  if (q.includes('sleep') || q.includes('rest') || q.includes('stretch') || q.includes('recover') || q.includes('stress')) {
    return `${icon} Recovery & Calm Reset:\n• Box Breathing: 4s inhale, 4s hold, 4s exhale, 4s hold (4 rounds).\n• Mobility: 5–10 mins gentle neck, shoulder, hip & lower-back stretches.\n• Sleep: Aim for 7–9 hours in a cool, dark room without late caffeine.`;
  }

  return `${icon} Plan for "${raw}":\n1. Warm up 5 minutes (light movement + joint circles).\n2. Perform 3–4 sets of 8–12 controlled reps with 60–90s rest.\n3. Stay hydrated, hit your protein goal, and rest well.\nAsk me for a specific meal combo, muscle split, or age group (0–90)!`;
}

export default function BloomCoach() {
  const [open, setOpen] = useState(false);
  const [coachGender, setCoachGender] = useState<'male' | 'female' | null>('female');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'model',
      text: '🌸 Hi! Unlimited fitness & nutrition coach ready. Ask anything!',
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
        if (data?.reply && !isQuotaOrApiError(data.reply)) {
          setMessages([...updated, { role: 'model', text: data.reply }]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore network/API error and use unlimited local coach engine
    }

    const smartReply = buildSmartCoachReply(userText, coachGender);
    setMessages([...updated, { role: 'model', text: smartReply }]);
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