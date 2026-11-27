'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Trophy,
  Calculator,
  Timer,
  ListChecks,
  Flame,
} from 'lucide-react';
import {
  WELLNESS_TOOLS,
  TOOL_CATEGORIES,
  ToolCategory,
  WellnessTool,
} from '@/lib/wellnessToolsData';

interface ModalProps {
  tool: WellnessTool | null;
  onClose: () => void;
  onEarnXp: (pts: number) => void;
}

export function InteractiveToolModal({ tool, onClose, onEarnXp }: ModalProps) {
  // Calculator Inputs
  const [weight, setWeight] = useState(68);
  const [height, setHeight] = useState(172);
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [liftWeight, setLiftWeight] = useState(60);
  const [liftReps, setLiftReps] = useState(8);
  const [steps, setSteps] = useState(8500);
  const [rhr, setRhr] = useState(68);
  const [waist, setWaist] = useState(78);
  const [wrist, setWrist] = useState(17);
  const [minutes, setMinutes] = useState(20);
  const [paceMin, setPaceMin] = useState(6);
  const [wakeHour, setWakeHour] = useState(7);
  const [bedHour, setBedHour] = useState(23);
  const [sleepAvg, setSleepAvg] = useState(6.5);

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [running, setRunning] = useState(false);

  // Checklist State
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!tool) return;
    setSecondsLeft(tool.timerSeconds || 60);
    setRunning(false);
    setChecked({});
    setClaimed(false);
  }, [tool]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const calcResult = useMemo(() => {
    if (!tool || tool.engine !== 'calculator') return null;
    const hM = height / 100;
    const bmr =
      gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = Math.round(bmr * 1.55);

    switch (tool.calcType) {
      case '1rm': {
        const oneRm = Math.round(liftWeight * (1 + liftReps / 30));
        return {
          main: `${oneRm} kg Estimated 1RM`,
          sub: `80% Hypertrophy: ${Math.round(oneRm * 0.8)} kg • 70% Volume: ${Math.round(oneRm * 0.7)} kg`,
        };
      }
      case 'relative-strength': {
        const ratio = (liftWeight / Math.max(1, weight)).toFixed(2);
        const tag = Number(ratio) >= 1.5 ? 'Advanced Athlete' : Number(ratio) >= 1.0 ? 'Solid Intermediate' : 'Building Base';
        return { main: `${ratio}x Bodyweight`, sub: `Rating: ${tag}` };
      }
      case 'plate-loader': {
        const perSide = Math.max(0, (liftWeight - 20) / 2);
        return {
          main: `${perSide} kg per side`,
          sub: liftWeight <= 20 ? 'Empty 20 kg Olympic barbell' : `Load ${perSide} kg on left & ${perSide} kg on right of a 20 kg bar`,
        };
      }
      case 'overload':
        return {
          main: `${(liftWeight + 2.5).toFixed(1)} kg × ${liftReps} reps`,
          sub: `Or stay at ${liftWeight} kg and push for ${liftReps + 2} clean reps next session.`,
        };
      case 'volume': {
        const weekly = liftReps * 3;
        return {
          main: `${weekly} Working Sets / Week`,
          sub: weekly >= 10 && weekly <= 20 ? 'Optimal 10–20 set hypertrophy sweet spot!' : weekly < 10 ? 'Add 1 more session to hit 10+ sets.' : 'High volume — ensure 8+ hrs sleep.',
        };
      }
      case 'warmup-ramp':
        return {
          main: `Set 1: ${Math.round(liftWeight * 0.4)}kg × 8 • Set 2: ${Math.round(liftWeight * 0.65)}kg × 5 • Set 3: ${Math.round(liftWeight * 0.85)}kg × 2`,
          sub: `Then rest 90s and start your working sets at ${liftWeight} kg.`,
        };
      case 'db-to-bb':
        return {
          main: `~${Math.round(liftWeight * 2 * 1.15)} kg Barbell Equivalent`,
          sub: `Based on a pair of ${liftWeight} kg dumbbells.`,
        };
      case 'tut':
        return {
          main: `${liftReps * 6} Seconds Tension / Set`,
          sub: 'Using 3s lowering + 1s pause + 2s lift tempo (ideal for muscle growth).',
        };
      case 'bmi': {
        const bmi = (weight / (hM * hM)).toFixed(1);
        return {
          main: `BMI: ${bmi}`,
          sub: Number(bmi) < 18.5 ? 'Underweight range' : Number(bmi) < 25 ? 'Healthy weight range' : 'Above standard range',
        };
      }
      case 'bmr':
        return { main: `${Math.round(bmr)} kcal / day`, sub: 'Base calories burned at complete 24-hour rest.' };
      case 'tdee':
        return { main: `${tdee} kcal / day`, sub: 'Estimated maintenance calories for moderate weekly activity.' };
      case 'ideal-weight': {
        const low = Math.round(19 * hM * hM);
        const high = Math.round(24 * hM * hM);
        return { main: `${low} kg – ${high} kg`, sub: `Healthy aesthetic weight range for ${height} cm.` };
      }
      case 'lbm': {
        const lbm = gender === 'male' ? 0.407 * weight + 0.267 * height - 19.2 : 0.252 * weight + 0.473 * height - 48.3;
        return { main: `${lbm.toFixed(1)} kg Lean Mass`, sub: 'Muscle, bone, water & organs excluding fat.' };
      }
      case 'body-fat': {
        const bf = Math.max(6, Math.min(45, (waist / height) * 42 - (gender === 'male' ? 6 : 0))).toFixed(1);
        return { main: `~${bf}% Estimated Body Fat`, sub: `Based on ${waist} cm waist and ${height} cm height.` };
      }
      case 'whtr': {
        const r = (waist / height).toFixed(2);
        return { main: `Ratio: ${r}`, sub: Number(r) < 0.5 ? 'Healthy (< 0.50 target achieved!)' : 'Aim to bring waist under half your height.' };
      }
      case 'bulking':
        return { main: `${tdee + 300} kcal / day`, sub: `Includes +300 kcal lean surplus & ${Math.round(weight * 1.8)}g protein.` };
      case 'cutting':
        return { main: `${Math.max(1200, tdee - 400)} kcal / day`, sub: `Includes -400 kcal fat-loss deficit & ${Math.round(weight * 2.0)}g protein.` };
      case 'recomp':
        return { main: `${tdee} kcal + ${Math.round(weight * 2.0)}g Protein`, sub: 'Eat at maintenance while progressively overloading weights.' };
      case 'weight-predict':
        return {
          main: `~${((minutes * 30) / 7700).toFixed(2)} kg Change in 30 Days`,
          sub: `Based on a ${minutes} kcal daily surplus/deficit.`,
        };
      case 'frame-size':
        return {
          main: wrist < 16 ? 'Small Frame' : wrist <= 18.5 ? 'Medium Frame' : 'Large Frame',
          sub: `Wrist circumference: ${wrist} cm.`,
        };
      case 'ffmi': {
        const lbm = weight * 0.84;
        const ffmi = (lbm / (hM * hM)).toFixed(1);
        return { main: `FFMI Score: ${ffmi}`, sub: '18–20 = Athletic • 21–23 = Muscular • 24–25 = Peak Natural.' };
      }
      case 'protein':
        return {
          main: `${Math.round(weight * 1.6)}g – ${Math.round(weight * 2.0)}g / day`,
          sub: `Split into 3–4 meals of ~${Math.round((weight * 1.8) / 4)}g protein each.`,
        };
      case 'water': {
        const liters = (weight * 0.035).toFixed(1);
        return { main: `${liters} Liters / day`, sub: `About ${Math.round((Number(liters) * 1000) / 250)} glasses (250ml each).` };
      }
      case 'sweat-water':
        return {
          main: `+${Math.round((minutes / 30) * 350)} ml Extra Water`,
          sub: `Add this to your base daily water for a ${minutes}-minute workout.`,
        };
      case 'macros': {
        const p = Math.round(weight * 1.8);
        const f = Math.round((tdee * 0.25) / 9);
        const c = Math.max(50, Math.round((tdee - p * 4 - f * 9) / 4));
        return { main: `${p}g Protein • ${c}g Carbs • ${f}g Fats`, sub: `Total: ${tdee} kcal/day.` };
      }
      case 'fiber':
        return { main: `${Math.round((tdee / 1000) * 14)}g Fiber / day`, sub: '14g per 1,000 kcal for smooth digestion & fullness.' };
      case 'caffeine': {
        const cutoff = (bedHour - 8 + 24) % 24;
        return { main: `Stop Caffeine by ${cutoff}:00`, sub: `8 hours before your ${bedHour}:00 bedtime protects deep sleep.` };
      }
      case 'hrmax':
        return { main: `${220 - age} BPM Max Heart Rate`, sub: `Never exceed this ceiling during sprints.` };
      case 'zone2': {
        const max = 220 - age;
        return { main: `${Math.round(max * 0.6)} – ${Math.round(max * 0.7)} BPM`, sub: 'Conversational pace for maximum fat burn and heart endurance.' };
      }
      case 'steps-calc':
        return {
          main: `${Math.round(steps * 0.04)} kcal • ${(steps * 0.00076).toFixed(1)} km`,
          sub: `From ${steps.toLocaleString()} steps today.`,
        };
      case 'vo2max': {
        const vo2 = (15.3 * ((220 - age) / Math.max(40, rhr))).toFixed(1);
        return { main: `${vo2} mL/kg/min VO2 Max`, sub: Number(vo2) >= 45 ? 'Strong athletic aerobic capacity!' : 'Improve with 3x/week Zone 2 cardio.' };
      }
      case 'run-pace':
        return {
          main: `5K: ${paceMin * 5} mins • 10K: ${paceMin * 10} mins`,
          sub: `At ${paceMin}:00 min/km steady pace.`,
        };
      case 'jump-rope':
        return { main: `~${Math.round(minutes * 12)} kcal Burned`, sub: `In ${minutes} minutes of moderate jump rope.` };
      case 'rhr':
        return {
          main: `${rhr} BPM Resting`,
          sub: rhr < 60 ? 'Athletic heart efficiency' : rhr <= 80 ? 'Healthy normal resting range' : 'Slightly elevated — focus on hydration & sleep',
        };
      case 'ergonomics':
        return {
          main: `Desk: ${Math.round(height * 0.41)} cm • Chair: ${Math.round(height * 0.25)} cm`,
          sub: `Keep screen top at eye level (~${Math.round(height * 0.68)} cm seated eye height).`,
        };
      case 'sleep-cycles': {
        const b1 = (wakeHour - 7.5 + 24) % 24;
        const b2 = (wakeHour - 9 + 24) % 24;
        return {
          main: `Sleep at ${Math.floor(b2)}:00 or ${Math.floor(b1)}:30`,
          sub: `Gives 5 to 6 complete 90-minute REM cycles before ${wakeHour}:00 AM.`,
        };
      }
      case 'sleep-debt': {
        const debt = Math.max(0, (8 - sleepAvg) * 7).toFixed(1);
        return {
          main: `${debt} Hours Weekly Sleep Debt`,
          sub: Number(debt) === 0 ? 'Zero sleep debt — great recovery!' : 'Add 30–45 mins earlier bedtime over the next 4 nights.',
        };
      }
      default:
        return { main: 'Ready', sub: '' };
    }
  }, [tool, weight, height, age, gender, liftWeight, liftReps, steps, rhr, waist, wrist, minutes, paceMin, wakeHour, bedHour, sleepAvg]);

  if (!tool) return null;

  // Breathing / Tabata Phase Prompt
  const getTimerCue = () => {
    if (tool.timerMode === 'box-breath') {
      const cycle = secondsLeft % 16;
      if (cycle > 12 || cycle === 0) return '🌬️ INHALE SLOWLY (4s)';
      if (cycle > 8) return '⏸️ HOLD BREATH (4s)';
      if (cycle > 4) return '😮‍💨 EXHALE SMOOTHLY (4s)';
      return '⏸️ HOLD EMPTY (4s)';
    }
    if (tool.timerMode === '478-breath') {
      const cycle = secondsLeft % 19;
      if (cycle > 15 || cycle === 0) return '🌬️ INHALE THROUGH NOSE (4s)';
      if (cycle > 8) return '⏸️ HOLD GENTLY (7s)';
      return '😮‍💨 WHOOSH EXHALE (8s)';
    }
    if (tool.timerMode === 'tabata') {
      return secondsLeft > 10 ? '🔥 MAX EFFORT WORK!' : '⚡ FAST TRANSITION / BREATHE';
    }
    return running ? '💪 STAY STRONG & BREATHE STEADY' : 'Press Start to Begin';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white bg-white p-6 text-slate-800 shadow-[10px_10px_0px_0px_#bae6fd]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl bg-sky-50 p-2 text-slate-500 hover:bg-sky-100 hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-2xl">
            {tool.emoji}
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-600">
              #{tool.id} • {tool.category}
            </span>
            <h3 className="text-xl font-black text-slate-900">{tool.title}</h3>
          </div>
        </div>

        <p className="mt-3 text-xs font-medium text-slate-600">{tool.tagline}</p>

        {/* ENGINE 1: INTERACTIVE CALCULATOR */}
        {tool.engine === 'calculator' && calcResult && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
              {['bmi', 'bmr', 'tdee', 'ideal-weight', 'lbm', 'body-fat', 'whtr', 'bulking', 'cutting', 'recomp', 'protein', 'water', 'macros', 'fiber', 'relative-strength', 'ffmi', 'ergonomics'].includes(tool.calcType || '') && (
                <>
                  <label className="text-xs font-bold text-slate-600">
                    Weight (kg)
                    <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                  </label>
                  <label className="text-xs font-bold text-slate-600">
                    Height (cm)
                    <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                  </label>
                </>
              )}

              {['bmr', 'tdee', 'lbm', 'body-fat', 'bulking', 'cutting', 'recomp', 'macros', 'fiber', 'hrmax', 'zone2', 'vo2max'].includes(tool.calcType || '') && (
                <>
                  <label className="text-xs font-bold text-slate-600">
                    Age
                    <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                  </label>
                  <label className="text-xs font-bold text-slate-600">
                    Gender
                    <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                </>
              )}

              {['1rm', 'relative-strength', 'plate-loader', 'overload', 'warmup-ramp', 'db-to-bb'].includes(tool.calcType || '') && (
                <label className="text-xs font-bold text-slate-600">
                  Weight Lifted (kg)
                  <input type="number" value={liftWeight} onChange={(e) => setLiftWeight(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}

              {['1rm', 'overload', 'volume', 'tut'].includes(tool.calcType || '') && (
                <label className="text-xs font-bold text-slate-600">
                  {tool.calcType === 'volume' ? 'Sets per Session' : 'Reps Performed'}
                  <input type="number" value={liftReps} onChange={(e) => setLiftReps(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}

              {['body-fat', 'whtr'].includes(tool.calcType || '') && (
                <label className="text-xs font-bold text-slate-600">
                  Waist (cm)
                  <input type="number" value={waist} onChange={(e) => setWaist(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}

              {tool.calcType === 'frame-size' && (
                <label className="col-span-2 text-xs font-bold text-slate-600">
                  Wrist Circumference (cm)
                  <input type="number" value={wrist} onChange={(e) => setWrist(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}

              {tool.calcType === 'steps-calc' && (
                <label className="col-span-2 text-xs font-bold text-slate-600">
                  Daily Steps
                  <input type="number" value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}

              {['vo2max', 'rhr'].includes(tool.calcType || '') && (
                <label className="text-xs font-bold text-slate-600">
                  Resting Heart Rate (BPM)
                  <input type="number" value={rhr} onChange={(e) => setRhr(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}

              {['sweat-water', 'jump-rope', 'weight-predict'].includes(tool.calcType || '') && (
                <label className="col-span-2 text-xs font-bold text-slate-600">
                  {tool.calcType === 'weight-predict' ? 'Daily Calorie Delta (kcal)' : 'Duration (Minutes)'}
                  <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}

              {tool.calcType === 'run-pace' && (
                <label className="col-span-2 text-xs font-bold text-slate-600">
                  Running Pace (Minutes per km)
                  <input type="number" value={paceMin} onChange={(e) => setPaceMin(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}

              {tool.calcType === 'caffeine' && (
                <label className="col-span-2 text-xs font-bold text-slate-600">
                  Target Bedtime Hour (24h format, e.g. 23 = 11 PM)
                  <input type="number" min={18} max={23} value={bedHour} onChange={(e) => setBedHour(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}

              {tool.calcType === 'sleep-cycles' && (
                <label className="col-span-2 text-xs font-bold text-slate-600">
                  Wake-Up Hour (AM, e.g. 7 = 7:00 AM)
                  <input type="number" min={4} max={11} value={wakeHour} onChange={(e) => setWakeHour(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}

              {tool.calcType === 'sleep-debt' && (
                <label className="col-span-2 text-xs font-bold text-slate-600">
                  Your Average Sleep Hours per Night
                  <input type="number" step="0.5" value={sleepAvg} onChange={(e) => setSleepAvg(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold" />
                </label>
              )}
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 p-5 text-white shadow-[5px_5px_0px_0px_#bae6fd]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-100">Live Result</p>
              <p className="mt-1 text-2xl font-black">{calcResult.main}</p>
              <p className="mt-1 text-xs font-medium text-sky-100">{calcResult.sub}</p>
            </div>
          </div>
        )}

        {/* ENGINE 2: LIVE TIMER / BREATHING PACER */}
        {tool.engine === 'timer' && (
          <div className="mt-5 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-6 text-center">
            <p className="text-xs font-black uppercase tracking-wider text-indigo-600">{getTimerCue()}</p>
            <p className="mt-3 text-6xl font-black text-slate-900">{secondsLeft}s</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setRunning((r) => !r)}
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-xs font-extrabold text-white shadow-[4px_4px_0px_0px_#bae6fd]"
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? 'Pause' : 'Start Timer'}
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(tool.timerSeconds || 60);
                }}
                className="flex items-center gap-1.5 rounded-2xl border border-sky-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 hover:bg-sky-50"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>
        )}

        {/* ENGINE 3: ACTIONABLE ROUTINE */}
        {tool.engine === 'routine' && tool.steps && (
          <div className="mt-5 space-y-2.5">
            {tool.steps.map((step, i) => (
              <div key={i} className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5 text-xs font-semibold text-slate-700">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-black text-white">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        )}

        {/* ENGINE 4: INTERACTIVE CHECKLIST */}
        {tool.engine === 'checklist' && tool.steps && (
          <div className="mt-5 space-y-2.5">
            {tool.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setChecked((p) => ({ ...p, [i]: !p[i] }))}
                className={`flex w-full items-start gap-2.5 rounded-2xl border p-3.5 text-left text-xs font-semibold transition ${
                  checked[i]
                    ? 'border-sky-400 bg-sky-100/80 text-sky-950'
                    : 'border-sky-100 bg-white text-slate-700 hover:bg-sky-50'
                }`}
              >
                <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${checked[i] ? 'text-sky-600' : 'text-slate-300'}`} />
                <span>{step}</span>
              </button>
            ))}
          </div>
        )}

        {/* Claim Wellness XP Button */}
        <div className="mt-6 border-t border-sky-100 pt-4">
          <button
            disabled={claimed}
            onClick={() => {
              setClaimed(true);
              onEarnXp(25);
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black transition ${
              claimed
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[4px_4px_0px_0px_#fbcfe8] hover:brightness-105'
            }`}
          >
            <Trophy className="h-4 w-4" />
            {claimed ? 'Completed! +25 Wellness XP Earned' : 'Mark Used & Claim +25 Wellness XP'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface HubProps {
  xp: number;
  onEarnXp: (pts: number) => void;
  initialCategory?: ToolCategory;
}

export default function WellnessStudioHub({ xp, onEarnXp, initialCategory = 'All' }: HubProps) {
  const [selectedCat, setSelectedCat] = useState<ToolCategory>(initialCategory);
  const [query, setQuery] = useState('');
  const [activeTool, setActiveTool] = useState<WellnessTool | null>(null);

  useEffect(() => {
    setSelectedCat(initialCategory);
  }, [initialCategory]);

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WELLNESS_TOOLS.filter((t) => {
      if (selectedCat !== 'All' && t.category !== selectedCat) return false;
      if (q) {
        return (
          t.title.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCat, query]);

  const level = Math.floor(xp / 100) + 1;

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      {/* Studio Banner */}
      <div className="rounded-[2rem] border border-white bg-white/90 p-7 shadow-[9px_9px_0px_0px_#bae6fd] backdrop-blur-xl sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-100 via-indigo-100 to-pink-100 px-3.5 py-1 text-xs font-extrabold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" /> 99 Interactive Health &amp; Workout Tools
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Wellness &amp; Fitness{' '}
              <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                99+ Studio
              </span>
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Click any of the 99 calculators, live breathing/HIIT timers, posture resets, or meal blueprints below.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3 shadow-[4px_4px_0px_0px_#fde68a]">
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <p className="text-[10px] font-black uppercase text-amber-700">Wellness Level {level}</p>
              <p className="text-base font-black text-slate-900">{xp} XP Earned</p>
            </div>
          </div>
        </div>

        {/* Search All 99 Tools */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-sky-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 99 features (e.g., 1RM, Tabata, Zone 2, Tech-Neck, Protein, Sleep, Roulette)..."
            className="w-full rounded-2xl border border-sky-200 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          {TOOL_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                selectedCat === c.id
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[3px_3px_0px_0px_#bae6fd]'
                  : 'border border-sky-100 bg-sky-50/60 text-slate-700 hover:bg-sky-100'
              }`}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 99 Tools Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setActiveTool(tool)}
            className="group cursor-pointer rounded-3xl border border-white bg-white/90 p-5 shadow-[6px_6px_0px_0px_#bae6fd] backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#7dd3fc]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 text-xl">
                {tool.emoji}
              </span>
              <div className="flex items-center gap-1.5">
                {tool.badge && (
                  <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-black text-rose-600">
                    {tool.badge}
                  </span>
                )}
                <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-[10px] font-black text-sky-700">
                  #{tool.id}
                </span>
              </div>
            </div>

            <h3 className="mt-4 text-base font-black text-slate-900 group-hover:text-sky-600">
              {tool.title}
            </h3>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600">
              {tool.tagline}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-sky-50 pt-3 text-[11px] font-extrabold text-indigo-600">
              <span className="flex items-center gap-1">
                {tool.engine === 'calculator' && <><Calculator className="h-3.5 w-3.5" /> Interactive Calc</>}
                {tool.engine === 'timer' && <><Timer className="h-3.5 w-3.5" /> Live Timer</>}
                {tool.engine === 'routine' && <><Sparkles className="h-3.5 w-3.5" /> Action Guide</>}
                {tool.engine === 'checklist' && <><ListChecks className="h-3.5 w-3.5" /> Checklist</>}
              </span>
              <span>Open →</span>
            </div>
          </div>
        ))}
      </div>

      <InteractiveToolModal
        tool={activeTool}
        onClose={() => setActiveTool(null)}
        onEarnXp={onEarnXp}
      />
    </section>
  );
}