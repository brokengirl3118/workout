'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Calculator,
  Timer,
  ListChecks,
  Flame,
  Zap,
} from 'lucide-react';
import {
  WELLNESS_TOOLS,
  TOOL_CATEGORIES,
  ToolCategory,
  WellnessTool,
} from '@/lib/wellnessToolsData';

const CLEAN_CAT_LABELS: Record<ToolCategory, string> = {
  All: 'All',
  'Strength & Gym': 'Strength',
  'Timers & Breath': 'Timers',
  'Body Metrics': 'Metrics',
  'Nutrition & Water': 'Nutrition',
  'Cardio & Heart': 'Cardio',
  'Posture & Mobility': 'Mobility',
  'Sleep & Recovery': 'Sleep',
  'Habits & Family': 'Habits',
};

interface ModalProps {
  tool: WellnessTool | null;
  onClose: () => void;
  onEarnXp: (pts: number) => void;
}

export function InteractiveToolModal({ tool, onClose, onEarnXp }: ModalProps) {
  // Default: 18-year-old Female
  const [weight, setWeight] = useState(54);
  const [height, setHeight] = useState(162);
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [liftWeight, setLiftWeight] = useState(30);
  const [liftReps, setLiftReps] = useState(10);
  const [steps, setSteps] = useState(8500);
  const [rhr, setRhr] = useState(68);
  const [waist, setWaist] = useState(68);
  const [wrist, setWrist] = useState(15.5);
  const [minutes, setMinutes] = useState(20);
  const [paceMin, setPaceMin] = useState(6);
  const [wakeHour, setWakeHour] = useState(7);
  const [bedHour, setBedHour] = useState(23);
  const [sleepAvg, setSleepAvg] = useState(7);

  const [secondsLeft, setSecondsLeft] = useState(60);
  const [running, setRunning] = useState(false);

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
          main: `${oneRm} kg Max`,
          sub: `80%: ${Math.round(oneRm * 0.8)} kg • 70%: ${Math.round(oneRm * 0.7)} kg`,
        };
      }
      case 'relative-strength': {
        const ratio = (liftWeight / Math.max(1, weight)).toFixed(2);
        return { main: `${ratio}x Bodyweight`, sub: 'Strength-to-weight ratio' };
      }
      case 'plate-loader': {
        const perSide = Math.max(0, (liftWeight - 20) / 2);
        return {
          main: `${perSide} kg / side`,
          sub: liftWeight <= 20 ? 'Empty 20 kg bar' : `Load ${perSide} kg each side`,
        };
      }
      case 'overload':
        return {
          main: `${(liftWeight + 2.5).toFixed(1)} kg × ${liftReps}`,
          sub: `Or ${liftWeight} kg × ${liftReps + 2} reps next session`,
        };
      case 'volume': {
        const weekly = liftReps * 3;
        return {
          main: `${weekly} Sets / Week`,
          sub: weekly >= 10 && weekly <= 20 ? 'Optimal muscle growth zone' : 'Adjust weekly sets to 10–20',
        };
      }
      case 'warmup-ramp':
        return {
          main: `${Math.round(liftWeight * 0.4)}kg → ${Math.round(liftWeight * 0.65)}kg → ${Math.round(liftWeight * 0.85)}kg`,
          sub: `3 warm-up sets before ${liftWeight} kg`,
        };
      case 'db-to-bb':
        return {
          main: `~${Math.round(liftWeight * 2 * 1.15)} kg Barbell`,
          sub: `From ${liftWeight} kg dumbbells`,
        };
      case 'tut':
        return { main: `${liftReps * 6}s Tension`, sub: '3-1-2 rep tempo' };
      case 'bmi': {
        const bmi = (weight / (hM * hM)).toFixed(1);
        return {
          main: `BMI ${bmi}`,
          sub: Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Healthy Range' : 'Above Range',
        };
      }
      case 'bmr':
        return { main: `${Math.round(bmr)} kcal / day`, sub: 'Resting metabolic rate' };
      case 'tdee':
        return { main: `${tdee} kcal / day`, sub: 'Daily maintenance calories' };
      case 'ideal-weight':
        return {
          main: `${Math.round(19 * hM * hM)} – ${Math.round(24 * hM * hM)} kg`,
          sub: `Healthy range for ${height} cm`,
        };
      case 'lbm': {
        const lbm = gender === 'male' ? 0.407 * weight + 0.267 * height - 19.2 : 0.252 * weight + 0.473 * height - 48.3;
        return { main: `${lbm.toFixed(1)} kg Lean Mass`, sub: 'Muscle, bone & water' };
      }
      case 'body-fat': {
        const bf = Math.max(10, Math.min(45, (waist / height) * 42 - (gender === 'male' ? 6 : 0))).toFixed(1);
        return { main: `~${bf}% Body Fat`, sub: `Waist ${waist} cm • Height ${height} cm` };
      }
      case 'whtr': {
        const r = (waist / height).toFixed(2);
        return { main: `Ratio ${r}`, sub: Number(r) < 0.5 ? 'Healthy (< 0.50)' : 'Target < 0.50' };
      }
      case 'bulking':
        return { main: `${tdee + 250} kcal / day`, sub: `+250 kcal • ${Math.round(weight * 1.8)}g protein` };
      case 'cutting':
        return { main: `${Math.max(1200, tdee - 350)} kcal / day`, sub: `-350 kcal • ${Math.round(weight * 2.0)}g protein` };
      case 'recomp':
        return { main: `${tdee} kcal • ${Math.round(weight * 2.0)}g Protein`, sub: 'Maintenance calories + progressive lift' };
      case 'weight-predict':
        return { main: `~${((minutes * 30) / 7700).toFixed(2)} kg / 30d`, sub: `At ${minutes} kcal daily delta` };
      case 'frame-size':
        return {
          main: wrist < 15.5 ? 'Small Frame' : wrist <= 17.5 ? 'Medium Frame' : 'Large Frame',
          sub: `Wrist ${wrist} cm`,
        };
      case 'ffmi': {
        const ffmi = ((weight * 0.8) / (hM * hM)).toFixed(1);
        return { main: `FFMI ${ffmi}`, sub: 'Natural muscularity index' };
      }
      case 'protein':
        return { main: `${Math.round(weight * 1.6)} – ${Math.round(weight * 2.0)}g / day`, sub: 'Daily protein target' };
      case 'water': {
        const liters = (weight * 0.035).toFixed(1);
        return { main: `${liters} L / day`, sub: `${Math.round((Number(liters) * 1000) / 250)} glasses` };
      }
      case 'sweat-water':
        return { main: `+${Math.round((minutes / 30) * 350)} ml`, sub: `For ${minutes} min workout` };
      case 'macros': {
        const p = Math.round(weight * 1.8);
        const f = Math.round((tdee * 0.25) / 9);
        const c = Math.max(50, Math.round((tdee - p * 4 - f * 9) / 4));
        return { main: `${p}g P • ${c}g C • ${f}g F`, sub: `${tdee} kcal total` };
      }
      case 'fiber':
        return { main: `${Math.round((tdee / 1000) * 14)}g Fiber / day`, sub: 'Daily gut health target' };
      case 'caffeine': {
        const cutoff = (bedHour - 8 + 24) % 24;
        return { main: `Cutoff ${cutoff}:00`, sub: `8h before ${bedHour}:00 sleep` };
      }
      case 'hrmax':
        return { main: `${220 - age} BPM`, sub: 'Max heart rate ceiling' };
      case 'zone2': {
        const max = 220 - age;
        return { main: `${Math.round(max * 0.6)} – ${Math.round(max * 0.7)} BPM`, sub: 'Zone 2 fat-burn heart rate' };
      }
      case 'steps-calc':
        return { main: `${Math.round(steps * 0.04)} kcal • ${(steps * 0.00076).toFixed(1)} km`, sub: `${steps.toLocaleString()} steps` };
      case 'vo2max': {
        const vo2 = (15.3 * ((220 - age) / Math.max(40, rhr))).toFixed(1);
        return { main: `${vo2} VO2 Max`, sub: 'Aerobic oxygen score' };
      }
      case 'run-pace':
        return { main: `5K: ${paceMin * 5}m • 10K: ${paceMin * 10}m`, sub: `${paceMin} min/km pace` };
      case 'jump-rope':
        return { main: `~${Math.round(minutes * 11)} kcal`, sub: `${minutes} min skipping` };
      case 'rhr':
        return { main: `${rhr} BPM`, sub: rhr <= 80 ? 'Healthy resting pulse' : 'Focus on rest & water' };
      case 'ergonomics':
        return { main: `Desk ${Math.round(height * 0.41)} cm • Chair ${Math.round(height * 0.25)} cm`, sub: `For ${height} cm height` };
      case 'sleep-cycles': {
        const b1 = (wakeHour - 7.5 + 24) % 24;
        const b2 = (wakeHour - 9 + 24) % 24;
        return { main: `${Math.floor(b2)}:00 or ${Math.floor(b1)}:30`, sub: `For ${wakeHour}:00 AM wake-up` };
      }
      case 'sleep-debt': {
        const debt = Math.max(0, (8 - sleepAvg) * 7).toFixed(1);
        return { main: `${debt} hrs Debt`, sub: 'Weekly sleep balance' };
      }
      default:
        return { main: 'Ready', sub: '' };
    }
  }, [tool, weight, height, age, gender, liftWeight, liftReps, steps, rhr, waist, wrist, minutes, paceMin, wakeHour, bedHour, sleepAvg]);

  if (!tool) return null;

  const getTimerCue = () => {
    if (tool.timerMode === 'box-breath') {
      const cycle = secondsLeft % 16;
      if (cycle > 12 || cycle === 0) return 'INHALE (4s)';
      if (cycle > 8) return 'HOLD (4s)';
      if (cycle > 4) return 'EXHALE (4s)';
      return 'HOLD (4s)';
    }
    if (tool.timerMode === '478-breath') {
      const cycle = secondsLeft % 19;
      if (cycle > 15 || cycle === 0) return 'INHALE (4s)';
      if (cycle > 8) return 'HOLD (7s)';
      return 'EXHALE (8s)';
    }
    if (tool.timerMode === 'tabata') {
      return secondsLeft > 10 ? 'WORK!' : 'REST';
    }
    return running ? 'ACTIVE' : 'READY';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="matte-box relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-3xl p-5 text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">
            {tool.emoji}
          </span>
          <h3 className="text-lg font-extrabold text-white">{tool.title}</h3>
        </div>

        <p className="mt-2 text-xs text-slate-300">{tool.tagline}</p>

        {/* CALCULATOR */}
        {tool.engine === 'calculator' && calcResult && (
          <div className="mt-4 space-y-3.5">
            <div className="matte-box-soft grid grid-cols-2 gap-2.5 rounded-2xl p-3.5">
              {['bmi', 'bmr', 'tdee', 'ideal-weight', 'lbm', 'body-fat', 'whtr', 'bulking', 'cutting', 'recomp', 'protein', 'water', 'macros', 'fiber', 'relative-strength', 'ffmi', 'ergonomics'].includes(tool.calcType || '') && (
                <>
                  <label className="text-[11px] font-bold text-slate-400">
                    Weight (kg)
                    <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                  </label>
                  <label className="text-[11px] font-bold text-slate-400">
                    Height (cm)
                    <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                  </label>
                </>
              )}

              {['bmr', 'tdee', 'lbm', 'body-fat', 'bulking', 'cutting', 'recomp', 'macros', 'fiber', 'hrmax', 'zone2', 'vo2max'].includes(tool.calcType || '') && (
                <>
                  <label className="text-[11px] font-bold text-slate-400">
                    Age
                    <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                  </label>
                  <label className="text-[11px] font-bold text-slate-400">
                    Gender
                    <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400">
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </label>
                </>
              )}

              {['1rm', 'relative-strength', 'plate-loader', 'overload', 'warmup-ramp', 'db-to-bb'].includes(tool.calcType || '') && (
                <label className="text-[11px] font-bold text-slate-400">
                  Weight (kg)
                  <input type="number" value={liftWeight} onChange={(e) => setLiftWeight(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}

              {['1rm', 'overload', 'volume', 'tut'].includes(tool.calcType || '') && (
                <label className="text-[11px] font-bold text-slate-400">
                  {tool.calcType === 'volume' ? 'Sets' : 'Reps'}
                  <input type="number" value={liftReps} onChange={(e) => setLiftReps(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}

              {['body-fat', 'whtr'].includes(tool.calcType || '') && (
                <label className="text-[11px] font-bold text-slate-400">
                  Waist (cm)
                  <input type="number" value={waist} onChange={(e) => setWaist(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}

              {tool.calcType === 'frame-size' && (
                <label className="col-span-2 text-[11px] font-bold text-slate-400">
                  Wrist (cm)
                  <input type="number" value={wrist} onChange={(e) => setWrist(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}

              {tool.calcType === 'steps-calc' && (
                <label className="col-span-2 text-[11px] font-bold text-slate-400">
                  Steps
                  <input type="number" value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}

              {['vo2max', 'rhr'].includes(tool.calcType || '') && (
                <label className="text-[11px] font-bold text-slate-400">
                  Resting BPM
                  <input type="number" value={rhr} onChange={(e) => setRhr(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}

              {['sweat-water', 'jump-rope', 'weight-predict'].includes(tool.calcType || '') && (
                <label className="col-span-2 text-[11px] font-bold text-slate-400">
                  {tool.calcType === 'weight-predict' ? 'Calorie Delta' : 'Minutes'}
                  <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}

              {tool.calcType === 'run-pace' && (
                <label className="col-span-2 text-[11px] font-bold text-slate-400">
                  Min / km
                  <input type="number" value={paceMin} onChange={(e) => setPaceMin(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}

              {tool.calcType === 'caffeine' && (
                <label className="col-span-2 text-[11px] font-bold text-slate-400">
                  Bedtime Hour (24h)
                  <input type="number" min={18} max={23} value={bedHour} onChange={(e) => setBedHour(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}

              {tool.calcType === 'sleep-cycles' && (
                <label className="col-span-2 text-[11px] font-bold text-slate-400">
                  Wake Hour (AM)
                  <input type="number" min={4} max={11} value={wakeHour} onChange={(e) => setWakeHour(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}

              {tool.calcType === 'sleep-debt' && (
                <label className="col-span-2 text-[11px] font-bold text-slate-400">
                  Avg Sleep Hours
                  <input type="number" step="0.5" value={sleepAvg} onChange={(e) => setSleepAvg(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#08080c] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sky-400" />
                </label>
              )}
            </div>

            <div className="matte-box rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Result</p>
              <p className="mt-0.5 text-xl font-extrabold text-white">{calcResult.main}</p>
              <p className="mt-0.5 text-xs text-slate-300">{calcResult.sub}</p>
            </div>
          </div>
        )}

        {/* TIMER */}
        {tool.engine === 'timer' && (
          <div className="matte-box-soft mt-4 rounded-2xl p-5 text-center">
            <p className="text-xs font-extrabold tracking-wider text-pink-400">{getTimerCue()}</p>
            <p className="mt-2 text-5xl font-extrabold text-white">{secondsLeft}s</p>
            <div className="mt-5 flex justify-center gap-2.5">
              <button
                onClick={() => setRunning((r) => !r)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-xs font-bold text-white"
              >
                {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {running ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(tool.timerSeconds || 60);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>
        )}

        {/* ROUTINE */}
        {tool.engine === 'routine' && tool.steps && (
          <div className="mt-4 space-y-2">
            {tool.steps.map((step, i) => (
              <div key={i} className="matte-box-soft rounded-xl p-3 text-xs text-slate-200">
                <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/30 text-[10px] font-bold text-sky-300">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        )}

        {/* CHECKLIST */}
        {tool.engine === 'checklist' && tool.steps && (
          <div className="mt-4 space-y-2">
            {tool.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setChecked((p) => ({ ...p, [i]: !p[i] }))}
                className={`flex w-full items-start gap-2.5 rounded-xl p-3 text-left text-xs font-semibold transition ${
                  checked[i] ? 'matte-box text-sky-300' : 'matte-box-soft text-slate-300'
                }`}
              >
                <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${checked[i] ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>{step}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 border-t border-white/10 pt-3.5">
          <button
            disabled={claimed}
            onClick={() => {
              setClaimed(true);
              onEarnXp(25);
            }}
            className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
              claimed
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:brightness-110'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            {claimed ? '+25 XP Earned' : 'Complete (+25 XP)'}
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

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="matte-box rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold text-white">Health Tools</h2>

          <div className="matte-pill flex items-center gap-2 rounded-full px-4 py-1.5">
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-extrabold text-white">{xp} XP</span>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-sky-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-xl border border-white/10 bg-[#09090d] py-2.5 pl-10 pr-4 text-xs font-semibold text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {TOOL_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                selectedCat === c.id
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                  : 'matte-box-soft text-slate-300 hover:text-white'
              }`}
            >
              <span>{c.emoji}</span> {CLEAN_CAT_LABELS[c.id]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setActiveTool(tool)}
            className="matte-box-soft group cursor-pointer rounded-2xl p-4 transition duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg">
                {tool.emoji}
              </span>
              {tool.badge && (
                <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-[10px] font-bold text-pink-300">
                  {tool.badge}
                </span>
              )}
            </div>

            <h3 className="mt-3 text-sm font-extrabold text-white group-hover:text-sky-300">
              {tool.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">
              {tool.tagline}
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] font-bold text-sky-400">
              <span className="flex items-center gap-1">
                {tool.engine === 'calculator' && <><Calculator className="h-3 w-3" /> Calc</>}
                {tool.engine === 'timer' && <><Timer className="h-3 w-3" /> Timer</>}
                {tool.engine === 'routine' && <><Zap className="h-3 w-3" /> Guide</>}
                {tool.engine === 'checklist' && <><ListChecks className="h-3 w-3" /> Check</>}
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