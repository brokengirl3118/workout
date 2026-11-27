'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Clock,
  Bell,
  Droplets,
  CheckCircle2,
  HeartPulse,
  Flame,
  Moon,
  Footprints,
} from 'lucide-react';

const HOURLY_NEEDS = [
  { hour: 6, time: '6:00 AM', title: 'Wake & Hydrate', need: '500ml water + 5 min morning light.' },
  { hour: 7, time: '7:00 AM', title: 'Morning Move', need: '20–40 min workout or brisk walk.' },
  { hour: 8, time: '8:00 AM', title: 'Protein Breakfast', need: '25g protein + clean carbs + water.' },
  { hour: 9, time: '9:00 AM', title: 'Posture Check', need: 'Sit tall, shoulders back, 250ml water.' },
  { hour: 10, time: '10:00 AM', title: 'Eye & Neck Reset', need: '20-20-20 eye rest + 2 min shoulder rolls.' },
  { hour: 11, time: '11:00 AM', title: 'Hydration Sip', need: '300ml water + light fruit or nuts.' },
  { hour: 12, time: '12:00 PM', title: 'Walk Break', need: '500 steps to refresh circulation.' },
  { hour: 13, time: '1:00 PM', title: 'Balanced Lunch', need: 'Lean protein, veggies & healthy fats.' },
  { hour: 14, time: '2:00 PM', title: 'Digestion Walk', need: '10 min easy walk after eating.' },
  { hour: 15, time: '3:00 PM', title: 'Water & Stretch', need: '350ml water + spine stretch.' },
  { hour: 16, time: '4:00 PM', title: 'Pre-Workout Fuel', need: 'Light fruit or protein snack.' },
  { hour: 17, time: '5:00 PM', title: 'Peak Training', need: 'Best window for strength or cardio.' },
  { hour: 18, time: '6:00 PM', title: 'Recovery Fuel', need: '500ml water + protein meal.' },
  { hour: 19, time: '7:00 PM', title: 'Light Dinner', need: 'Easy-to-digest protein & greens.' },
  { hour: 20, time: '8:00 PM', title: 'Evening Stretch', need: '10 min mobility + dim bright screens.' },
  { hour: 21, time: '9:00 PM', title: 'Wind Down', need: 'Small water sips & calm room lights.' },
  { hour: 22, time: '10:00 PM', title: 'Deep Sleep', need: '7–9 hrs sleep for full recovery.' },
];

export default function MaintainerView() {
  const [subTab, setSubTab] = useState<'checkup' | 'hourly' | 'reminders'>('checkup');

  // Default: 18-year-old Female
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [heightCm, setHeightCm] = useState(162);
  const [weightKg, setWeightKg] = useState(54);
  const [activity, setActivity] = useState(1.55);

  const [waterGlasses, setWaterGlasses] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [waterReminder, setWaterReminder] = useState(false);
  const [postureReminder, setPostureReminder] = useState(false);
  const [stretchReminder, setStretchReminder] = useState(false);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const [currentHour, setCurrentHour] = useState<number | null>(null);

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

  useEffect(() => {
    const timers: ReturnType<typeof setInterval>[] = [];
    if (waterReminder) {
      timers.push(setInterval(() => triggerNotification('💧 Water', 'Drink 250ml water now!'), 60 * 60 * 1000));
    }
    if (postureReminder) {
      timers.push(setInterval(() => triggerNotification('🪑 Posture', 'Sit tall & rest eyes 20s.'), 30 * 60 * 1000));
    }
    if (stretchReminder) {
      timers.push(setInterval(() => triggerNotification('🧘 Stretch', '2-minute neck & back stretch.'), 90 * 60 * 1000));
    }
    return () => timers.forEach(clearInterval);
  }, [waterReminder, postureReminder, stretchReminder]);

  const metrics = useMemo(() => {
    const hM = heightCm / 100;
    const bmi = Number((weightKg / (hM * hM)).toFixed(1));
    let bmiLabel = 'Healthy';
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
    const steps = age < 18 ? '10k–12k' : age >= 65 ? '5k–7k' : '8k–10k';

    return { bmi, bmiLabel, calories, proteinG, carbsG, fatsG, waterLiters, targetGlasses, sleepHrs, steps };
  }, [age, gender, heightCm, weightKg, activity]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="matte-box rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <HeartPulse className="h-6 w-6 text-pink-400" />
            <h2 className="text-2xl font-extrabold text-white">Maintainer</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'checkup', label: 'Checkup', icon: Activity },
              { id: 'hourly', label: 'Hourly', icon: Clock },
              { id: 'reminders', label: 'Reminders', icon: Bell },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setSubTab(t.id as 'checkup' | 'hourly' | 'reminders')}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    subTab === t.id
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/20'
                      : 'matte-box-soft text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {alertBanner && (
          <div className="matte-box-soft mt-4 flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs font-bold text-sky-300">
            <span>{alertBanner}</span>
            <button onClick={() => setAlertBanner(null)} className="text-pink-400 underline">Dismiss</button>
          </div>
        )}

        {/* TAB 1: CHECKUP */}
        {subTab === 'checkup' && (
          <div className="mt-6 space-y-5">
            <div className="matte-box-soft grid gap-3 rounded-2xl p-4 sm:grid-cols-5">
              <label className="text-[11px] font-bold text-slate-400">
                Age
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0b10] px-3 py-2 text-sm font-bold text-white outline-none focus:border-sky-400"
                />
              </label>
              <label className="text-[11px] font-bold text-slate-400">
                Gender
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0b10] px-3 py-2 text-sm font-bold text-white outline-none focus:border-sky-400"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </label>
              <label className="text-[11px] font-bold text-slate-400">
                Height (cm)
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0b10] px-3 py-2 text-sm font-bold text-white outline-none focus:border-sky-400"
                />
              </label>
              <label className="text-[11px] font-bold text-slate-400">
                Weight (kg)
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0b10] px-3 py-2 text-sm font-bold text-white outline-none focus:border-sky-400"
                />
              </label>
              <label className="text-[11px] font-bold text-slate-400">
                Activity
                <select
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0b10] px-3 py-2 text-sm font-bold text-white outline-none focus:border-sky-400"
                >
                  <option value={1.2}>Sedentary</option>
                  <option value={1.375}>Light</option>
                  <option value={1.55}>Moderate</option>
                  <option value={1.725}>Active</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="matte-box-soft rounded-2xl p-4">
                <p className="text-[11px] font-bold uppercase text-slate-400">BMI</p>
                <p className="mt-1 text-2xl font-extrabold text-sky-400">{metrics.bmi}</p>
                <span className="mt-1.5 inline-block rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                  {metrics.bmiLabel}
                </span>
              </div>

              <div className="matte-box-soft rounded-2xl p-4">
                <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400">
                  <Flame className="h-3.5 w-3.5 text-amber-400" /> Calories
                </p>
                <p className="mt-1 text-2xl font-extrabold text-white">{metrics.calories} kcal</p>
                <p className="mt-1 text-[11px] text-slate-400">Daily target</p>
              </div>

              <div className="matte-box-soft rounded-2xl p-4">
                <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400">
                  <Droplets className="h-3.5 w-3.5 text-cyan-400" /> Water
                </p>
                <p className="mt-1 text-2xl font-extrabold text-cyan-300">{metrics.waterLiters} L</p>
                <p className="mt-1 text-[11px] text-slate-400">{metrics.targetGlasses} glasses</p>
              </div>

              <div className="matte-box-soft rounded-2xl p-4">
                <p className="text-[11px] font-bold uppercase text-slate-400">Macros</p>
                <p className="mt-1 text-base font-extrabold text-white">
                  Protein: <span className="text-pink-400">{metrics.proteinG}g</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-300">
                  Carbs: {metrics.carbsG}g • Fats: {metrics.fatsG}g
                </p>
              </div>

              <div className="matte-box-soft rounded-2xl p-4">
                <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400">
                  <Moon className="h-3.5 w-3.5 text-violet-400" /> Sleep
                </p>
                <p className="mt-1 text-xl font-extrabold text-violet-300">{metrics.sleepHrs}</p>
                <p className="mt-1 text-[11px] text-slate-400">Nightly recovery</p>
              </div>

              <div className="matte-box-soft rounded-2xl p-4">
                <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400">
                  <Footprints className="h-3.5 w-3.5 text-emerald-400" /> Steps
                </p>
                <p className="mt-1 text-xl font-extrabold text-emerald-300">{metrics.steps}</p>
                <p className="mt-1 text-[11px] text-slate-400">Daily movement</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOURLY */}
        {subTab === 'hourly' && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {HOURLY_NEEDS.map((item) => {
              const isNow = currentHour !== null && item.hour === currentHour;
              return (
                <div
                  key={item.hour}
                  className={`rounded-2xl p-3.5 ${
                    isNow ? 'matte-box' : 'matte-box-soft'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                      {item.time}
                    </span>
                    <span className="text-xs font-extrabold text-white">{item.title}</span>
                    {isNow && (
                      <span className="ml-auto rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        NOW
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-300">{item.need}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: REMINDERS */}
        {subTab === 'reminders' && (
          <div className="mt-6 space-y-5">
            <div className="matte-box-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Droplets className="h-6 w-6 text-cyan-400" />
                <div>
                  <p className="text-sm font-extrabold text-white">Water Log</p>
                  <p className="text-xs text-cyan-300">
                    {waterGlasses} / {metrics.targetGlasses} glasses ({(waterGlasses * 0.25).toFixed(2)} L)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateWater(waterGlasses - 1)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-bold text-white hover:bg-white/10"
                >
                  -
                </button>
                <button
                  onClick={() => updateWater(waterGlasses + 1)}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-1.5 text-xs font-bold text-white"
                >
                  + 1 Glass
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Alerts</h3>
                <button
                  onClick={() => triggerNotification('FitLife Alert', 'Hydration & posture check!')}
                  className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-300 hover:bg-sky-500/30"
                >
                  Test Alert
                </button>
              </div>
              <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
                {[
                  { key: 'water' as const, label: 'Water (60m)', active: waterReminder },
                  { key: 'posture' as const, label: 'Posture (30m)', active: postureReminder },
                  { key: 'stretch' as const, label: 'Stretch (90m)', active: stretchReminder },
                ].map((r) => (
                  <button
                    key={r.key}
                    onClick={() => enableReminders(r.key)}
                    className={`rounded-2xl p-3.5 text-left transition ${
                      r.active ? 'matte-box text-white' : 'matte-box-soft text-slate-300'
                    }`}
                  >
                    <p className="text-xs font-bold">{r.label}</p>
                    <p className={`mt-1 text-[11px] ${r.active ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {r.active ? 'ON' : 'OFF'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                'Workout / 30m Walk',
                'Daily Protein Goal',
                '10m Morning Sunlight',
                'Full-Body Stretch',
                '7–8+ Hours Sleep',
                'Screen-Free Bedtime',
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => toggleCheck(item)}
                  className={`flex items-center gap-2.5 rounded-2xl p-3 text-left text-xs font-bold transition ${
                    checks[item] ? 'matte-box text-sky-300' : 'matte-box-soft text-slate-300'
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${checks[item] ? 'text-emerald-400' : 'text-slate-600'}`} />
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}