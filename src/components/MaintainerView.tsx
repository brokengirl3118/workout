'use client';

import { useState, useEffect, useMemo } from 'react';
import { Activity, Clock, Bell, Droplets, CheckCircle2, HeartPulse, Flame, Moon, Footprints } from 'lucide-react';

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

export default function MaintainerView() {
  const [subTab, setSubTab] = useState<'checkup' | 'hourly' | 'reminders'>('checkup');
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [heightCm, setHeightCm] = useState(172);
  const [weightKg, setWeightKg] = useState(68);
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

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {/* Header Card */}
      <div className="rounded-3xl border-2 border-sky-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0284c7] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-sky-900 bg-sky-200 px-3 py-1 text-xs font-black uppercase tracking-wider text-sky-950">
              <HeartPulse className="h-3.5 w-3.5" /> Health Measuring Hub
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Body <span className="text-sky-600">Maintainer</span>
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Calculate your full-body requirements, follow your hourly needs, and activate live health reminders.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'checkup', label: 'Body Checkup', icon: Activity },
              { id: 'hourly', label: 'Hourly Needs', icon: Clock },
              { id: 'reminders', label: 'Reminders & Log', icon: Bell },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setSubTab(t.id as 'checkup' | 'hourly' | 'reminders')}
                  className={`flex items-center gap-1.5 rounded-xl border-2 border-sky-900 px-4 py-2.5 text-xs font-extrabold transition-all ${
                    subTab === t.id
                      ? 'bg-sky-500 text-white shadow-[4px_4px_0px_0px_#0c4a6e]'
                      : 'bg-sky-50 text-sky-950 shadow-[3px_3px_0px_0px_#bae6fd] hover:translate-x-[1px] hover:translate-y-[1px]'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {alertBanner && (
          <div className="mt-5 flex items-center justify-between rounded-2xl border-2 border-sky-900 bg-sky-200 px-4 py-3 text-xs font-extrabold text-sky-950 shadow-[4px_4px_0px_0px_#0c4a6e]">
            <span>{alertBanner}</span>
            <button onClick={() => setAlertBanner(null)} className="underline">Dismiss</button>
          </div>
        )}

        {/* TAB 1: BODY CHECKUP */}
        {subTab === 'checkup' && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 rounded-2xl border-2 border-sky-900 bg-sky-50 p-5 sm:grid-cols-5">
              <label className="text-xs font-extrabold uppercase text-sky-950">
                Age
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border-2 border-sky-900 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:bg-sky-100"
                />
              </label>
              <label className="text-xs font-extrabold uppercase text-sky-950">
                Gender
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="mt-1.5 w-full rounded-xl border-2 border-sky-900 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
              <label className="text-xs font-extrabold uppercase text-sky-950">
                Height (cm)
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border-2 border-sky-900 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                />
              </label>
              <label className="text-xs font-extrabold uppercase text-sky-950">
                Weight (kg)
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border-2 border-sky-900 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                />
              </label>
              <label className="text-xs font-extrabold uppercase text-sky-950">
                Activity
                <select
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border-2 border-sky-900 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                >
                  <option value={1.2}>Sedentary</option>
                  <option value={1.375}>Light</option>
                  <option value={1.55}>Moderate</option>
                  <option value={1.725}>Active</option>
                </select>
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border-2 border-sky-900 bg-white p-5 shadow-[5px_5px_0px_0px_#38bdf8] transition hover:-translate-y-1">
                <p className="text-xs font-extrabold uppercase text-slate-500">BMI Score</p>
                <p className="mt-2 text-3xl font-black text-sky-600">{metrics.bmi}</p>
                <span className="mt-2 inline-block rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-900">
                  {metrics.bmiLabel}
                </span>
              </div>

              <div className="rounded-2xl border-2 border-sky-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0ea5e9] transition hover:-translate-y-1">
                <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-slate-500">
                  <Flame className="h-4 w-4 text-orange-500" /> Daily Calories
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900">{metrics.calories} kcal</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Maintenance energy target</p>
              </div>

              <div className="rounded-2xl border-2 border-sky-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0284c7] transition hover:-translate-y-1">
                <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-slate-500">
                  <Droplets className="h-4 w-4 text-sky-500" /> Daily Water Need
                </p>
                <p className="mt-2 text-3xl font-black text-blue-600">{metrics.waterLiters} L</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">~{metrics.targetGlasses} glasses (250ml)</p>
              </div>

              <div className="rounded-2xl border-2 border-sky-900 bg-white p-5 shadow-[5px_5px_0px_0px_#38bdf8] transition hover:-translate-y-1">
                <p className="text-xs font-extrabold uppercase text-slate-500">Daily Macros</p>
                <p className="mt-2 text-lg font-black text-slate-900">
                  Protein: <span className="text-sky-600">{metrics.proteinG}g</span>
                </p>
                <p className="mt-1 text-xs font-bold text-slate-600">
                  Carbs: {metrics.carbsG}g • Fats: {metrics.fatsG}g
                </p>
              </div>

              <div className="rounded-2xl border-2 border-sky-900 bg-white p-5 shadow-[5px_5px_0px_0px_#818cf8] transition hover:-translate-y-1">
                <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-slate-500">
                  <Moon className="h-4 w-4 text-indigo-500" /> Sleep Requirement
                </p>
                <p className="mt-2 text-2xl font-black text-indigo-600">{metrics.sleepHrs}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Deep muscle & hormone repair</p>
              </div>

              <div className="rounded-2xl border-2 border-sky-900 bg-white p-5 shadow-[5px_5px_0px_0px_#2dd4bf] transition hover:-translate-y-1">
                <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-slate-500">
                  <Footprints className="h-4 w-4 text-teal-500" /> Daily Steps
                </p>
                <p className="mt-2 text-2xl font-black text-teal-600">{metrics.steps}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Heart & joint longevity</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOURLY NEEDS */}
        {subTab === 'hourly' && (
          <div className="mt-8 space-y-3">
            <p className="text-xs font-bold text-sky-700">
              Your current hour is highlighted automatically so you know what your body needs right now.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {HOURLY_NEEDS.map((item) => {
                const isNow = currentHour !== null && item.hour === currentHour;
                return (
                  <div
                    key={item.hour}
                    className={`rounded-2xl border-2 border-sky-900 p-4 transition ${
                      isNow
                        ? 'bg-sky-200 shadow-[5px_5px_0px_0px_#0c4a6e]'
                        : 'bg-white shadow-[3px_3px_0px_0px_#bae6fd]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-sky-900 px-2.5 py-0.5 text-xs font-black text-white">
                        {item.time}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">{item.title}</span>
                      {isNow && (
                        <span className="ml-auto rounded-full bg-sky-600 px-2.5 py-0.5 text-[10px] font-black text-white">
                          NOW
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-700">{item.need}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: REMINDERS & DAILY LOG */}
        {subTab === 'reminders' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-sky-900 bg-sky-50 p-5 shadow-[5px_5px_0px_0px_#38bdf8]">
              <div className="flex items-center gap-3">
                <Droplets className="h-8 w-8 text-sky-600" />
                <div>
                  <p className="text-base font-extrabold text-slate-900">Today&apos;s Water Intake</p>
                  <p className="text-xs font-bold text-sky-700">
                    {waterGlasses} / {metrics.targetGlasses} glasses ({(waterGlasses * 0.25).toFixed(2)} L)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateWater(waterGlasses - 1)}
                  className="rounded-xl border-2 border-sky-900 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-[3px_3px_0px_0px_#0c4a6e] active:translate-y-[2px]"
                >
                  -
                </button>
                <button
                  onClick={() => updateWater(waterGlasses + 1)}
                  className="rounded-xl border-2 border-sky-900 bg-sky-500 px-5 py-2 text-sm font-black text-white shadow-[3px_3px_0px_0px_#0c4a6e] active:translate-y-[2px]"
                >
                  + 1 Glass
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Live Automatic Reminders
                </h3>
                <button
                  onClick={() =>
                    triggerNotification('FitLife Maintainer', 'Reminders are working! Stay hydrated & keep good posture.')
                  }
                  className="rounded-lg border-2 border-sky-900 bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-900 hover:bg-sky-200"
                >
                  Test Alert Now
                </button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                {[
                  { key: 'water' as const, label: 'Water Every 60 Min', active: waterReminder },
                  { key: 'posture' as const, label: 'Posture & Eyes (30m)', active: postureReminder },
                  { key: 'stretch' as const, label: 'Stretch Every 90 Min', active: stretchReminder },
                ].map((r) => (
                  <button
                    key={r.key}
                    onClick={() => enableReminders(r.key)}
                    className={`rounded-2xl border-2 border-sky-900 p-4 text-left transition ${
                      r.active
                        ? 'bg-sky-500 text-white shadow-[4px_4px_0px_0px_#0c4a6e]'
                        : 'bg-white text-slate-800 shadow-[4px_4px_0px_0px_#bae6fd] hover:bg-sky-50'
                    }`}
                  >
                    <p className="text-sm font-extrabold">{r.label}</p>
                    <p className="mt-1 text-xs font-semibold opacity-90">
                      {r.active ? 'ON — Active' : 'OFF — Click to Enable'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Daily Full-Body Checklist
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                    className={`flex items-center gap-3 rounded-2xl border-2 border-sky-900 p-3.5 text-left text-xs font-extrabold transition ${
                      checks[item]
                        ? 'bg-sky-200 text-sky-950 shadow-[4px_4px_0px_0px_#0c4a6e]'
                        : 'bg-white text-slate-700 shadow-[3px_3px_0px_0px_#bae6fd] hover:bg-sky-50'
                    }`}
                  >
                    <CheckCircle2 className={`h-5 w-5 ${checks[item] ? 'text-sky-700' : 'text-slate-300'}`} />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}