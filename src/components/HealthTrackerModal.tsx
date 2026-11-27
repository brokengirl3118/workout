'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Activity, Clock, Bell, Droplets, CheckCircle2, HeartPulse } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const HOURLY_NEEDS = [
  { hour: 6, time: '6:00 AM', title: 'Wake & Hydrate', need: '500ml warm water + 5 min sunlight & light mobility.' },
  { hour: 7, time: '7:00 AM', title: 'Morning Workout / Walk', need: '20–45 min exercise or brisk walking to boost metabolism.' },
  { hour: 8, time: '8:00 AM', title: 'High-Protein Breakfast', need: '25–30g protein + complex carbs + 1 glass water.' },
  { hour: 9, time: '9:00 AM', title: 'Deep Focus & Posture Check', need: 'Sit tall, shoulders back, 250ml water.' },
  { hour: 10, time: '10:00 AM', title: 'Eye Rest & Micro-Stretch', need: '20-20-20 eye rule + 2 min neck/shoulder rolls.' },
  { hour: 11, time: '11:00 AM', title: 'Mid-Morning Hydration', need: '300ml water + light fruit or handful of nuts.' },
  { hour: 12, time: '12:00 PM', title: 'Stand & Walk Break', need: 'Walk 500 steps to reset circulation and hip flexors.' },
  { hour: 13, time: '1:00 PM', title: 'Balanced Lunch', need: 'Lean protein, fiber/veggies, healthy fats, slow eating.' },
  { hour: 14, time: '2:00 PM', title: 'Post-Meal Digestion Walk', need: '10 min gentle walk to stabilize blood sugar.' },
  { hour: 15, time: '3:00 PM', title: 'Afternoon Hydration', need: '350ml water + posture reset (avoid slouching).' },
  { hour: 16, time: '4:00 PM', title: 'Energy Snack / Pre-Workout', need: 'Light carbs + protein if training in the evening.' },
  { hour: 17, time: '5:00 PM', title: 'Strength / Cardio Window', need: 'Peak body temperature — ideal time for gym or home workout.' },
  { hour: 18, time: '6:00 PM', title: 'Post-Workout Recovery', need: '500ml water/electrolytes + protein-rich recovery meal.' },
  { hour: 19, time: '7:00 PM', title: 'Light Dinner', need: 'Easy-to-digest protein & vegetables (finish 3 hrs before bed).' },
  { hour: 20, time: '8:00 PM', title: 'Decompress & Stretch', need: '10 min gentle stretching + reduce bright screen glare.' },
  { hour: 21, time: '9:00 PM', title: 'Sleep Prep', need: 'Small sips of water only; dim lights to trigger melatonin.' },
  { hour: 22, time: '10:00 PM', title: 'Deep Sleep Window', need: '7–9 hours of quality sleep for muscle and hormone repair.' },
];

export default function HealthTrackerModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<'checkup' | 'hourly' | 'reminders'>('checkup');

  // Body Checkup Inputs
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [heightCm, setHeightCm] = useState(172);
  const [weightKg, setWeightKg] = useState(68);
  const [activity, setActivity] = useState(1.55); // Moderate

  // Daily Tracker State
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  // Live Reminders State
  const [waterReminder, setWaterReminder] = useState(false);
  const [postureReminder, setPostureReminder] = useState(false);
  const [stretchReminder, setStretchReminder] = useState(false);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const [currentHour, setCurrentHour] = useState<number | null>(null);

  // Load saved daily progress & current hour on client
  useEffect(() => {
    setCurrentHour(new Date().getHours());
    const savedWater = localStorage.getItem('fitlife_water');
    const savedChecks = localStorage.getItem('fitlife_checks');
    if (savedWater) setWaterGlasses(Number(savedWater));
    if (savedChecks) setChecks(JSON.parse(savedChecks));
  }, []);

  const updateWater = (val: number) => {
    const next = Math.max(0, Math.min(20, val));
    setWaterGlasses(next);
    localStorage.setItem('fitlife_water', String(next));
  };

  const toggleCheck = (key: string) => {
    const updated = { ...checks, [key]: !checks[key] };
    setChecks(updated);
    localStorage.setItem('fitlife_checks', JSON.stringify(updated));
  };

  const triggerNotification = (title: string, body: string) => {
    setAlertBanner(`${title}: ${body}`);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const enableReminders = async (type: 'water' | 'posture' | 'stretch') => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (type === 'water') setWaterReminder((v) => !v);
    if (type === 'posture') setPostureReminder((v) => !v);
    if (type === 'stretch') setStretchReminder((v) => !v);
  };

  // Active Reminder Timers
  useEffect(() => {
    const timers: ReturnType<typeof setInterval>[] = [];
    if (waterReminder) {
      timers.push(setInterval(() => triggerNotification('💧 Hydration Reminder', 'Drink 250ml of water right now!'), 60 * 60 * 1000));
    }
    if (postureReminder) {
      timers.push(setInterval(() => triggerNotification('🪑 Posture & Eye Rest', 'Sit straight and look 20ft away for 20 seconds.'), 30 * 60 * 1000));
    }
    if (stretchReminder) {
      timers.push(setInterval(() => triggerNotification('🧘 Stretch Break', 'Stand up and stretch your back, neck, and hips for 2 minutes.'), 90 * 60 * 1000));
    }
    return () => timers.forEach(clearInterval);
  }, [waterReminder, postureReminder, stretchReminder]);

  // Full Body Calculations (Mifflin-St Jeor)
  const metrics = useMemo(() => {
    const hM = heightCm / 100;
    const bmi = Number((weightKg / (hM * hM)).toFixed(1));
    let bmiLabel = 'Healthy Weight';
    if (bmi < 18.5) bmiLabel = 'Underweight';
    else if (bmi >= 25 && bmi < 30) bmiLabel = 'Overweight';
    else if (bmi >= 30) bmiLabel = 'Obese';

    const bmr =
      gender === 'male'
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    const calories = Math.round(bmr * activity);
    const proteinG = Math.round(weightKg * 1.6);
    const fatsG = Math.round((calories * 0.25) / 9);
    const carbsG = Math.max(50, Math.round((calories - proteinG * 4 - fatsG * 9) / 4));
    const waterLiters = Number((weightKg * 0.035).toFixed(1));
    const targetGlasses = Math.round((waterLiters * 1000) / 250);
    const sleepHrs = age < 13 ? '9–11 hrs' : age < 18 ? '8–10 hrs' : age >= 65 ? '7–8 hrs' : '7–9 hrs';
    const steps = age < 18 ? '10,000–12,000' : age >= 65 ? '5,000–7,000' : '8,000–10,000';

    return { bmi, bmiLabel, calories, proteinG, carbsG, fatsG, waterLiters, targetGlasses, sleepHrs, steps };
  }, [age, gender, heightCm, weightKg, activity]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5 py-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Full Body Health & Hourly Tracker</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-zinc-800 bg-zinc-900/50 px-5 py-2.5">
          {[
            { id: 'checkup', label: 'Body Checkup & Needs', icon: Activity },
            { id: 'hourly', label: 'Every-Hour Schedule', icon: Clock },
            { id: 'reminders', label: 'Reminders & Daily Log', icon: Bell },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as 'checkup' | 'hourly' | 'reminders')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  tab === t.id ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Live Alert Banner */}
        {alertBanner && (
          <div className="flex items-center justify-between bg-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-300">
            <span>{alertBanner}</span>
            <button onClick={() => setAlertBanner(null)} className="underline">Dismiss</button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'checkup' && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-5">
                <label className="text-xs text-zinc-400">
                  Age
                  <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white" />
                </label>
                <label className="text-xs text-zinc-400">
                  Gender
                  <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>
                <label className="text-xs text-zinc-400">
                  Height (cm)
                  <input type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white" />
                </label>
                <label className="text-xs text-zinc-400">
                  Weight (kg)
                  <input type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white" />
                </label>
                <label className="text-xs text-zinc-400">
                  Activity
                  <select value={activity} onChange={(e) => setActivity(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white">
                    <option value={1.2}>Sedentary</option>
                    <option value={1.375}>Light</option>
                    <option value={1.55}>Moderate</option>
                    <option value={1.725}>Active</option>
                  </select>
                </label>
              </div>

              {/* Daily Requirements Grid */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <p className="text-xs text-zinc-400">BMI Score</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-400">{metrics.bmi}</p>
                  <p className="text-xs text-zinc-300">{metrics.bmiLabel}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <p className="text-xs text-zinc-400">Daily Calories</p>
                  <p className="mt-1 text-2xl font-extrabold text-white">{metrics.calories} kcal</p>
                  <p className="text-xs text-zinc-400">Maintenance target</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <p className="text-xs text-zinc-400">Daily Water Need</p>
                  <p className="mt-1 text-2xl font-extrabold text-sky-400">{metrics.waterLiters} L</p>
                  <p className="text-xs text-zinc-400">~{metrics.targetGlasses} glasses (250ml)</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <p className="text-xs text-zinc-400">Daily Macros</p>
                  <p className="mt-1 text-sm font-bold text-white">
                    Protein: <span className="text-emerald-400">{metrics.proteinG}g</span>
                  </p>
                  <p className="text-xs text-zinc-300">Carbs: {metrics.carbsG}g • Fats: {metrics.fatsG}g</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <p className="text-xs text-zinc-400">Sleep Requirement</p>
                  <p className="mt-1 text-xl font-bold text-purple-400">{metrics.sleepHrs}</p>
                  <p className="text-xs text-zinc-400">Deep recovery target</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <p className="text-xs text-zinc-400">Daily Steps</p>
                  <p className="mt-1 text-xl font-bold text-amber-400">{metrics.steps}</p>
                  <p className="text-xs text-zinc-400">Heart & joint health</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'hourly' && (
            <div className="space-y-2.5">
              <p className="text-xs text-zinc-400">
                Your current hour is highlighted automatically so you know what your body needs right now.
              </p>
              {HOURLY_NEEDS.map((item) => {
                const isNow = item.hour === currentHour;
                return (
                  <div
                    key={item.hour}
                    className={`flex items-start justify-between gap-4 rounded-xl border p-3.5 ${
                      isNow
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-zinc-800 bg-zinc-900/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400">{item.time}</span>
                        <span className="text-sm font-bold text-white">{item.title}</span>
                        {isNow && (
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-black">
                            NOW
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-zinc-300">{item.need}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'reminders' && (
            <div className="space-y-6">
              {/* Water Counter */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-3">
                  <Droplets className="h-7 w-7 text-sky-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Today&apos;s Water Intake</p>
                    <p className="text-xs text-zinc-400">
                      {waterGlasses} / {metrics.targetGlasses} glasses ({(waterGlasses * 0.25).toFixed(2)} L)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateWater(waterGlasses - 1)} className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-bold hover:bg-zinc-700">-</button>
                  <button onClick={() => updateWater(waterGlasses + 1)} className="rounded-lg bg-sky-500 px-4 py-1.5 text-sm font-bold text-black hover:bg-sky-400">+ 1 Glass</button>
                </div>
              </div>

              {/* Live Browser Reminders */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Live Automatic Reminders</h3>
                  <button
                    onClick={() => triggerNotification('🌸 FitLife Test Alert', 'Reminders are working! Stay hydrated & keep good posture.')}
                    className="text-xs font-semibold text-emerald-400 hover:underline"
                  >
                    Test Alert Now
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                    { key: 'water' as const, label: 'Water Every 60 Min', active: waterReminder },
                    { key: 'posture' as const, label: 'Posture & Eyes (30m)', active: postureReminder },
                    { key: 'stretch' as const, label: 'Stretch Every 90 Min', active: stretchReminder },
                  ].map((r) => (
                    <button
                      key={r.key}
                      onClick={() => enableReminders(r.key)}
                      className={`rounded-xl border p-3.5 text-left transition ${
                        r.active
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <p className="text-xs font-bold">{r.label}</p>
                      <p className="mt-1 text-[11px] opacity-80">{r.active ? 'ON — Active' : 'OFF — Click to Enable'}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Full-Body Checklist */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Daily Full-Body Checklist</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    'Completed Workout / 30m Walk',
                    'Hit Daily Protein Target',
                    '10 Min Morning Sunlight',
                    'Full-Body Stretching / Mobility',
                    '7–8+ Hours Quality Sleep',
                    'No Screens 30m Before Bed',
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleCheck(item)}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left text-xs font-semibold transition ${
                        checks[item]
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <CheckCircle2 className={`h-4 w-4 ${checks[item] ? 'text-emerald-400' : 'text-zinc-600'}`} />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}