'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Dumbbell,
  ShieldCheck,
  X,
  PlayCircle,
  HeartPulse,
  Home,
  Info,
  ArrowRight,
  ArrowLeft,
  Zap,
  Users,
  Activity,
  Droplets,
  Flame,
  Star,
  Baby,
  Smile,
  Award,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Play,
  Layers,
  Trophy,
  Heart,
  Shuffle,
  Wind,
  Plus,
  Minus,
} from 'lucide-react';
import { supabase, Exercise } from '@/lib/supabase';
import { AGE_GROUPS, LevelKey } from '@/lib/data';
import {
  BODY_PART_CATEGORIES,
  TARGET_GOALS,
  TIME_OF_DAY_OPTIONS,
  matchesBodyPart,
  matchesTargetGoal,
  matchesTimeOfDay,
} from '@/lib/exerciseFilters';
import { WELLNESS_TOOLS, TOOL_CATEGORIES, ToolCategory, WellnessTool } from '@/lib/wellnessToolsData';
import LevelGuideModal from '@/components/LevelGuideModal';
import BloomCoach from '@/components/BloomCoach';
import ExerciseAnimator from '@/components/ExerciseAnimator';
import MaintainerView from '@/components/MaintainerView';
import GuidedExercisePlayer from '@/components/GuidedExercisePlayer';
import WellnessStudioHub, { InteractiveToolModal } from '@/components/WellnessStudioHub';
import WelcomeSplash from '@/components/WelcomeSplash';

type NavTab = 'home' | 'maintainer' | 'exercises' | 'tools' | 'about';
type ExerciseStep = 1 | 2 | 3;
type MoodKey = 'energetic' | 'tired' | 'stressed' | 'sore';

const SHORT_CAT_NAMES: Record<ToolCategory, string> = {
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

const MOOD_PRESETS: Record<
  MoodKey,
  { label: string; emoji: string; tip: string; actionLabel: string; toolId: number }
> = {
  energetic: {
    label: 'Energetic',
    emoji: '⚡',
    tip: 'Channel that energy into a 4-minute Tabata blast.',
    actionLabel: 'Start Tabata',
    toolId: 16,
  },
  tired: {
    label: 'Low Energy',
    emoji: '🔋',
    tip: 'Take 1 glass of water + a 5-minute spine wake-up.',
    actionLabel: 'Spine Wake-Up',
    toolId: 74,
  },
  stressed: {
    label: 'Stressed',
    emoji: '🌿',
    tip: 'Reset your heart rate with 4-4-4-4 Box Breathing.',
    actionLabel: 'Breathe Now',
    toolId: 18,
  },
  sore: {
    label: 'Sore',
    emoji: '🧊',
    tip: 'Follow the gentle DOMS relief flow to recover faster.',
    actionLabel: 'Recovery Flow',
    toolId: 85,
  },
};

export default function HomePage() {
  const [activeNav, setActiveNav] = useState<NavTab>('home');
  const [exerciseStep, setExerciseStep] = useState<ExerciseStep>(1);
  const [toolCategory, setToolCategory] = useState<ToolCategory>('All');
  const [quickTool, setQuickTool] = useState<WellnessTool | null>(null);
  const [xp, setXp] = useState<number>(0);

  // New User-Favorite Home Features State
  const [streak, setStreak] = useState<number>(1);
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [waterGlasses, setWaterGlasses] = useState<number>(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [breathOn, setBreathOn] = useState<boolean>(false);
  const [breathTick, setBreathTick] = useState<number>(0);

  // Exercises State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<string>('all');

  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [guideLevel, setGuideLevel] = useState<LevelKey | null>(null);

  // Load saved XP, Water, Favorites & Daily Streak safely on client
  useEffect(() => {
    const savedXp = localStorage.getItem('fitlife_xp');
    if (savedXp) setXp(Number(savedXp));

    const savedWater = localStorage.getItem('fitlife_water');
    if (savedWater) setWaterGlasses(Number(savedWater));

    const savedFavs = localStorage.getItem('fitlife_favorites');
    if (savedFavs) {
      try {
        setFavoriteIds(JSON.parse(savedFavs));
      } catch {
        setFavoriteIds([]);
      }
    }

    // Daily Streak Calculator
    const today = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem('fitlife_last_visit');
    const savedStreak = Number(localStorage.getItem('fitlife_streak') || '0');

    if (!lastVisit) {
      setStreak(1);
      localStorage.setItem('fitlife_streak', '1');
      localStorage.setItem('fitlife_last_visit', today);
    } else if (lastVisit === today) {
      setStreak(Math.max(1, savedStreak));
    } else {
      const prev = new Date(lastVisit);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      const nextStreak = diffDays === 1 ? savedStreak + 1 : 1;
      setStreak(nextStreak);
      localStorage.setItem('fitlife_streak', String(nextStreak));
      localStorage.setItem('fitlife_last_visit', today);
    }
  }, []);

  // Live Mini Calm-Breath Timer
  useEffect(() => {
    if (!breathOn) return;
    const t = setInterval(() => {
      setBreathTick((prev) => (prev + 1) % 12);
    }, 1000);
    return () => clearInterval(t);
  }, [breathOn]);

  const earnXp = (pts: number) => {
    setXp((prev) => {
      const next = prev + pts;
      localStorage.setItem('fitlife_xp', String(next));
      return next;
    });
  };

  const updateWater = (nextVal: number) => {
    const clamped = Math.max(0, Math.min(16, nextVal));
    setWaterGlasses(clamped);
    localStorage.setItem('fitlife_water', String(clamped));
    if (clamped > waterGlasses) earnXp(5);
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      localStorage.setItem('fitlife_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const spinRandomExercise = () => {
    if (exercises.length === 0) return;
    const pick = exercises[Math.floor(Math.random() * exercises.length)];
    setActiveExercise(pick);
    setIsGuidedMode(false);
  };

  useEffect(() => {
    const fetchAllExercises = async () => {
      let allRows: Exercise[] = [];
      let from = 0;
      const batchSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name')
          .range(from, from + batchSize - 1);

        if (error) {
          setDbError(error.message);
          break;
        }
        if (!data || data.length === 0) break;
        allRows = [...allRows, ...(data as Exercise[])];
        if (data.length < batchSize) break;
        from += batchSize;
      }

      setExercises(allRows);
      setLoading(false);
    };
    fetchAllExercises();
  }, []);

  const activeBodyGroup = BODY_PART_CATEGORIES.find((b) => b.id === selectedBodyPart);
  const activeGoalObj = TARGET_GOALS.find((g) => g.id === selectedGoal);
  const activeTimeObj = TIME_OF_DAY_OPTIONS.find((t) => t.id === selectedTime);

  const favoriteExercises = useMemo(
    () => exercises.filter((ex) => favoriteIds.includes(ex.id)).slice(0, 6),
    [exercises, favoriteIds]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (q) {
        const matchText =
          ex.name.toLowerCase().includes(q) ||
          ex.muscle_group.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q) ||
          ex.category.toLowerCase().includes(q);
        if (!matchText) return false;
      } else if (selectedAge !== 'all') {
        if (!ex.age_groups.includes(selectedAge)) return false;
      }

      if (selectedGender !== 'All') {
        if (ex.gender_focus !== 'Unisex' && ex.gender_focus !== selectedGender) return false;
      }

      if (!matchesBodyPart(ex, selectedBodyPart, selectedMuscle)) return false;
      if (!matchesTargetGoal(ex, selectedGoal)) return false;
      if (!matchesTimeOfDay(ex, selectedTime)) return false;

      return true;
    });
  }, [
    exercises,
    search,
    selectedAge,
    selectedGender,
    selectedBodyPart,
    selectedMuscle,
    selectedGoal,
    selectedTime,
  ]);

  const visibleExercises = filtered.slice(0, visibleCount);

  const openExercisesWizard = () => {
    setActiveNav('exercises');
    setExerciseStep(1);
  };

  const resetAllFilters = () => {
    setSearch('');
    setSelectedAge('all');
    setSelectedGender('All');
    setSelectedBodyPart('all');
    setSelectedMuscle('all');
    setSelectedGoal('all');
    setSelectedTime('all');
    setVisibleCount(24);
    setExerciseStep(1);
  };

  const jumpToAge = (ageId: string) => {
    setSearch('');
    setSelectedAge(ageId);
    setSelectedBodyPart('all');
    setSelectedMuscle('all');
    setVisibleCount(24);
    setActiveNav('exercises');
    setExerciseStep(1);
  };

  const featuredQuickTools = useMemo(
    () =>
      [1, 16, 17, 18, 28, 35, 36, 42, 43, 58, 69, 92]
        .map((id) => WELLNESS_TOOLS.find((t) => t.id === id))
        .filter(Boolean) as WellnessTool[],
    []
  );

  const breathPhase =
    !breathOn
      ? 'Tap to Relax'
      : breathTick < 4
      ? 'Inhale...'
      : breathTick < 8
      ? 'Hold...'
      : 'Exhale...';

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#060609] text-slate-100">
      <WelcomeSplash />

      {/* Subtle Ambient Matte Glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* STICKY MATTE NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#08080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => setActiveNav('home')}
            className="flex items-center gap-2.5 text-left transition hover:scale-[1.02]"
          >
            <div className="matte-pill flex h-9 w-9 items-center justify-center rounded-xl text-sky-400">
              <Dumbbell className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              FitLife{' '}
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                0–90
              </span>
            </h1>
          </button>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'maintainer', label: 'Maintainer', icon: HeartPulse },
              { id: 'exercises', label: 'Exercises', icon: Dumbbell },
              { id: 'tools', label: 'Tools', icon: Layers },
              { id: 'about', label: 'About', icon: Info },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'exercises') {
                      openExercisesWizard();
                    } else if (item.id === 'tools') {
                      setToolCategory('All');
                      setActiveNav('tools');
                    } else {
                      setActiveNav(item.id as NavTab);
                    }
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'matte-pill text-white shadow-md shadow-sky-500/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-sky-400" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* =========================================================
          PAGE 1: HOME (AGE GROUPS AT TOP + USEFUL DAILY TOOLS)
         ========================================================= */}
      {activeNav === 'home' && (
        <div className="mx-auto max-w-5xl space-y-7 px-4 py-7">
          {/* 1. AGE GROUPS RIGHT AT THE TOP */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-white">Age Groups</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-3 py-1 text-[11px] font-bold text-orange-300">
                  <Flame className="h-3.5 w-3.5" /> {streak} Day Streak
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-300">
                  <Trophy className="h-3.5 w-3.5" /> {xp} XP
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  id: '0-2',
                  title: 'Kids',
                  ages: '0 – 12 yrs',
                  desc: 'Playful balance & motor drills.',
                  icon: Baby,
                  badge: 'bg-cyan-500/20 text-cyan-300',
                },
                {
                  id: '13-17',
                  title: 'Teens',
                  ages: '13 – 17 yrs',
                  desc: 'Agility, posture & core strength.',
                  icon: Zap,
                  badge: 'bg-indigo-500/20 text-indigo-300',
                },
                {
                  id: '18-39',
                  title: 'Adults',
                  ages: '18 – 59 yrs',
                  desc: 'Gym, dumbbells & cardio mastery.',
                  icon: Award,
                  badge: 'bg-pink-500/20 text-pink-300',
                },
                {
                  id: '60-74',
                  title: 'Seniors',
                  ages: '60 – 90 yrs',
                  desc: 'Chair mobility & joint care.',
                  icon: Smile,
                  badge: 'bg-emerald-500/20 text-emerald-300',
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={() => jumpToAge(card.id)}
                    className="matte-box group cursor-pointer rounded-2xl p-4 transition hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${card.badge}`}>
                        {card.ages}
                      </span>
                      <Icon className="h-4 w-4 text-slate-300 group-hover:text-sky-300" />
                    </div>
                    <h3 className="mt-3 text-base font-extrabold text-white">{card.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. DAILY ESSENTIALS: WATER + CALM BREATH + SURPRISE WORKOUT */}
          <section className="grid gap-3.5 md:grid-cols-3">
            {/* Live Water Tracker */}
            <div className="matte-box-soft flex flex-col justify-between rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-cyan-300">
                  <Droplets className="h-4 w-4" /> Water Today
                </span>
                <span className="text-xs font-bold text-white">{waterGlasses} / 8</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }}
                />
              </div>
              <div className="mt-3.5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  {(waterGlasses * 0.25).toFixed(2)} L drank
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateWater(waterGlasses - 1)}
                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/15"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => updateWater(waterGlasses + 1)}
                    className="flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-sky-400"
                  >
                    <Plus className="h-3 w-3" /> Glass
                  </button>
                </div>
              </div>
            </div>

            {/* 1-Tap Calm Breathing Mini-Pacer */}
            <div
              onClick={() => {
                setBreathOn((v) => !v);
                setBreathTick(0);
              }}
              className="matte-box-soft flex cursor-pointer items-center justify-between rounded-2xl p-4 transition hover:-translate-y-0.5"
            >
              <div>
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-300">
                  <Wind className="h-4 w-4" /> Calm Breath
                </span>
                <p className="mt-2 text-lg font-extrabold text-white">{breathPhase}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {breathOn ? 'Tap to stop' : '4-4-4 instant reset'}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-indigo-400/50 bg-indigo-500/20 text-indigo-300 transition-transform duration-1000 ${
                  breathOn && breathTick < 8 ? 'scale-110 bg-sky-500/30' : 'scale-90'
                }`}
              >
                <Wind className="h-5 w-5" />
              </div>
            </div>

            {/* 1-Tap Surprise Workout Spinner */}
            <div className="matte-box-soft flex flex-col justify-between rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-pink-300">
                  <Shuffle className="h-4 w-4" /> Quick Pick
                </span>
                <span className="text-[11px] text-slate-400">Random Move</span>
              </div>
              <p className="mt-2 text-xs text-slate-300">
                Not sure what to do? Spin a surprise exercise right now.
              </p>
              <button
                onClick={spinRandomExercise}
                disabled={loading || exercises.length === 0}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                <Shuffle className="h-3.5 w-3.5" /> Spin Exercise
              </button>
            </div>
          </section>

          {/* 3. MOOD CHECK-IN BAR */}
          <section className="matte-box-soft rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-extrabold text-white">How do you feel right now?</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(MOOD_PRESETS) as MoodKey[]).map((key) => {
                  const m = MOOD_PRESETS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setMood(key)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        mood === key
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                          : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {m.emoji} {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {mood && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                <p className="text-xs text-sky-300">{MOOD_PRESETS[mood].tip}</p>
                <button
                  onClick={() => {
                    const target = WELLNESS_TOOLS.find((t) => t.id === MOOD_PRESETS[mood].toolId);
                    if (target) setQuickTool(target);
                  }}
                  className="rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/30"
                >
                  {MOOD_PRESETS[mood].actionLabel} →
                </button>
              </div>
            )}
          </section>

          {/* 4. SAVED FAVORITE EXERCISES (IF ANY BOOKMARKED) */}
          {favoriteExercises.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-lg font-extrabold text-white">
                  <Heart className="h-4 w-4 fill-pink-500 text-pink-500" /> Saved Moves
                </h3>
                <button
                  onClick={openExercisesWizard}
                  className="text-xs font-bold text-pink-400 hover:underline"
                >
                  Add More →
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {favoriteExercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => {
                      setActiveExercise(ex);
                      setIsGuidedMode(false);
                    }}
                    className="matte-box-soft flex cursor-pointer items-center justify-between gap-2 rounded-2xl p-3.5 transition hover:-translate-y-0.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-white">{ex.name}</p>
                      <p className="truncate text-[11px] text-sky-400">{ex.muscle_group}</p>
                    </div>
                    <PlayCircle className="h-5 w-5 shrink-0 text-pink-400" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. MAIN ACTION BANNER */}
          <section className="matte-box rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                  Move Better.{' '}
                  <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                    Live Stronger.
                  </span>
                </h2>
                <p className="mt-1.5 max-w-md text-xs text-slate-300">
                  Animated workouts, daily body tracking, timers, and personal 🥷 &amp; 🌸 coaches.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={openExercisesWizard}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-110"
                >
                  Exercises <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setActiveNav('tools')}
                  className="matte-pill flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-indigo-300 hover:text-white"
                >
                  <Layers className="h-3.5 w-3.5" /> Health Tools
                </button>
                <button
                  onClick={() => setActiveNav('maintainer')}
                  className="matte-pill flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-pink-300 hover:text-white"
                >
                  <HeartPulse className="h-3.5 w-3.5" /> Maintainer
                </button>
              </div>
            </div>
          </section>

          {/* 6. QUICK TOOLS GRID */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white">Quick Tools</h3>
              <button
                onClick={() => setActiveNav('tools')}
                className="text-xs font-bold text-sky-400 hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredQuickTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setQuickTool(tool)}
                  className="matte-box-soft group flex items-center gap-3 rounded-2xl p-3.5 text-left transition hover:-translate-y-0.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-base">
                    {tool.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-white group-hover:text-sky-300">
                      {tool.title}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">{tool.tagline}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 7. TOOL CATEGORIES */}
          <section className="matte-box rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white">Categories</h3>
              <button
                onClick={() => setActiveNav('tools')}
                className="rounded-xl bg-sky-500/20 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/30"
              >
                Open Tools
              </button>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
              {TOOL_CATEGORIES.filter((c) => c.id !== 'All').map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setToolCategory(c.id);
                    setActiveNav('tools');
                  }}
                  className="matte-box-soft flex items-center gap-2.5 rounded-2xl p-3 text-left transition hover:-translate-y-0.5"
                >
                  <span className="text-xl">{c.emoji}</span>
                  <p className="text-xs font-extrabold text-slate-100">{SHORT_CAT_NAMES[c.id]}</p>
                </button>
              ))}
            </div>
          </section>

          {/* 8. LEVEL GUIDES */}
          <section className="matte-box rounded-3xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <Star className="h-3.5 w-3.5" /> Level Plans
                </span>
                <h3 className="mt-0.5 text-lg font-extrabold text-white">Training Guides</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as LevelKey[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setGuideLevel(lvl)}
                    className="matte-pill flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-slate-200 hover:text-white"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================
          PAGE 2: MAINTAINER
         ========================================================= */}
      {activeNav === 'maintainer' && <MaintainerView />}

      {/* =========================================================
          PAGE 3: EXERCISES WIZARD
         ========================================================= */}
      {activeNav === 'exercises' && (
        <section className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { step: 1 as ExerciseStep, label: '1. Body Part' },
              { step: 2 as ExerciseStep, label: '2. Goal & Time' },
              { step: 3 as ExerciseStep, label: '3. Workouts' },
            ].map((s) => (
              <button
                key={s.step}
                onClick={() => setExerciseStep(s.step)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  exerciseStep === s.step
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                    : 'matte-box-soft text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {exerciseStep === 1 && (
            <div className="matte-box mx-auto max-w-3xl rounded-3xl p-6">
              <h2 className="text-center text-2xl font-extrabold text-white">
                Select Body Part
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {BODY_PART_CATEGORIES.map((bp) => {
                  const isSelected = selectedBodyPart === bp.id;
                  return (
                    <button
                      key={bp.id}
                      onClick={() => {
                        setSelectedBodyPart(bp.id);
                        setSelectedMuscle('all');
                        if (bp.muscles.length <= 1) {
                          setExerciseStep(2);
                        }
                      }}
                      className={`flex flex-col items-center rounded-2xl p-4 text-center transition hover:-translate-y-0.5 ${
                        isSelected ? 'matte-box text-white' : 'matte-box-soft text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="text-2xl">{bp.emoji}</span>
                      <span className="mt-2 text-xs font-extrabold">{bp.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeBodyGroup && activeBodyGroup.muscles.length > 1 && (
                <div className="matte-box-soft mt-6 rounded-2xl p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                    {activeBodyGroup.label} Muscles (A–Z)
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedMuscle('all');
                        setExerciseStep(2);
                      }}
                      className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      All {activeBodyGroup.label} →
                    </button>
                    {activeBodyGroup.muscles.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedMuscle(m);
                          setExerciseStep(2);
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/15"
                      >
                        {m} →
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setExerciseStep(2)}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 text-xs font-bold text-white"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {exerciseStep === 2 && (
            <div className="matte-box mx-auto max-w-3xl rounded-3xl p-6">
              <h2 className="text-center text-2xl font-extrabold text-white">
                Goal &amp; Time
              </h2>

              <div className="mt-6">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-pink-400">
                  Target Goal
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                  {TARGET_GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGoal(g.id)}
                      className={`rounded-2xl p-3.5 text-left transition ${
                        selectedGoal === g.id ? 'matte-box text-white' : 'matte-box-soft text-slate-300 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-extrabold">{g.label}</p>
                      {g.tip && <p className="mt-1 text-[10px] text-slate-400">{g.tip}</p>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Time of Day
                </p>
                <div className="grid gap-2.5 sm:grid-cols-5">
                  {TIME_OF_DAY_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTime(t.id)}
                      className={`flex flex-col items-center rounded-2xl p-3 text-center transition ${
                        selectedTime === t.id ? 'matte-box text-white' : 'matte-box-soft text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{t.emoji}</span>
                      <span className="mt-1 text-xs font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between gap-3">
                <button
                  onClick={() => setExerciseStep(1)}
                  className="matte-box-soft flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <button
                  onClick={() => {
                    setVisibleCount(24);
                    setExerciseStep(3);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 text-xs font-bold text-white"
                >
                  Show Workouts <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {exerciseStep === 3 && (
            <div>
              <div className="matte-box rounded-3xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setExerciseStep(2)}
                      className="matte-box-soft flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
                    >
                      <ArrowLeft className="h-3 w-3" /> Back
                    </button>
                    <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-300">
                      {activeBodyGroup?.emoji} {activeBodyGroup?.label}
                      {selectedMuscle !== 'all' ? `: ${selectedMuscle}` : ''}
                    </span>
                    <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-300">
                      {activeGoalObj?.label}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                      {activeTimeObj?.emoji} {activeTimeObj?.label}
                    </span>
                  </div>

                  <button
                    onClick={resetAllFilters}
                    className="flex items-center gap-1 rounded-xl bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                  <div className="relative min-w-[220px] flex-1">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-sky-400" />
                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setVisibleCount(24);
                      }}
                      placeholder="Search exercises..."
                      className="w-full rounded-xl border border-white/10 bg-[#09090d] py-2 pl-9 pr-3 text-xs font-semibold text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
                    />
                  </div>

                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#09090d] px-3 py-2 text-xs font-bold text-slate-200 outline-none"
                  >
                    {AGE_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-1 rounded-xl border border-white/10 bg-[#09090d] p-1">
                    {['All', 'Male', 'Female'].map((gen) => (
                      <button
                        key={gen}
                        onClick={() => setSelectedGender(gen)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          selectedGender === gen
                            ? 'bg-sky-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading ? (
                <p className="mt-10 text-center text-xs font-bold text-sky-400">Loading...</p>
              ) : dbError ? (
                <p className="mt-10 text-center text-xs font-bold text-rose-400">{dbError}</p>
              ) : filtered.length === 0 ? (
                <div className="mt-10 text-center">
                  <p className="text-xs font-bold text-slate-400">No matches found.</p>
                  <button
                    onClick={() => setExerciseStep(2)}
                    className="mt-3 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white"
                  >
                    Change Goal or Time
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleExercises.map((ex) => {
                      const isFav = favoriteIds.includes(ex.id);
                      return (
                        <div
                          key={ex.id}
                          onClick={() => {
                            setActiveExercise(ex);
                            setIsGuidedMode(false);
                          }}
                          className="matte-box-soft group relative cursor-pointer overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-1"
                        >
                          <div className="relative h-44 w-full overflow-hidden bg-black">
                            {ex.media_url && (
                              <img
                                src={ex.media_url}
                                alt={ex.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(ex.id);
                              }}
                              title="Save Favorite"
                              className="absolute left-2.5 top-2.5 rounded-full bg-black/75 p-1.5 backdrop-blur transition hover:scale-110"
                            >
                              <Heart
                                className={`h-3.5 w-3.5 ${
                                  isFav ? 'fill-pink-500 text-pink-500' : 'text-slate-300'
                                }`}
                              />
                            </button>
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-bold text-sky-300 backdrop-blur">
                              <PlayCircle className="h-3 w-3" /> Live Form
                            </div>
                          </div>
                          <div className="p-3.5">
                            <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-sky-300">
                                {ex.level}
                              </span>
                              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-indigo-300">
                                {ex.muscle_group}
                              </span>
                              <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-pink-300">
                                {ex.equipment}
                              </span>
                            </div>
                            <h3 className="mt-2 text-base font-extrabold text-white group-hover:text-sky-300">
                              {ex.name}
                            </h3>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {ex.sets_reps}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {visibleCount < filtered.length && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => setVisibleCount((c) => c + 24)}
                        className="matte-pill rounded-xl px-6 py-2.5 text-xs font-bold text-sky-300 hover:text-white"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* =========================================================
          PAGE 4: HEALTH TOOLS
         ========================================================= */}
      {activeNav === 'tools' && (
        <WellnessStudioHub
          xp={xp}
          onEarnXp={earnXp}
          initialCategory={toolCategory}
        />
      )}

      {/* =========================================================
          PAGE 5: ABOUT (ANIMATED DEDICATION ONLY)
         ========================================================= */}
      {activeNav === 'about' && (
        <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-12">
          <div className="matte-box relative w-full overflow-hidden rounded-3xl px-8 py-16 text-center shadow-2xl shadow-pink-500/10">
            {/* Soft Floating Animated Hearts */}
            <span className="animate-float-up pointer-events-none absolute left-[18%] top-2/3 text-lg opacity-60">
              🌸
            </span>
            <span className="animate-float-up pointer-events-none absolute right-[20%] top-3/4 text-base opacity-60 [animation-delay:1.1s]">
              💖
            </span>
            <span className="animate-float-up pointer-events-none absolute left-[48%] top-3/4 text-sm opacity-60 [animation-delay:2.1s]">
              🌷
            </span>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/15 shadow-lg shadow-pink-500/20">
              <Heart className="animate-heartbeat h-8 w-8 fill-pink-500 text-pink-400" />
            </div>

            <h2 className="animate-shimmer-text mt-6 bg-gradient-to-r from-pink-400 via-sky-300 to-rose-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              Created for my Hubie with Love.
            </h2>
          </div>
        </section>
      )}

      {/* Exercise Modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="matte-box relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-5 text-slate-100 shadow-2xl">
            <div className="absolute right-4 top-4 flex items-center gap-1.5">
              <button
                onClick={() => toggleFavorite(activeExercise.id)}
                title="Save Favorite"
                className="rounded-xl bg-white/10 p-1.5 hover:bg-white/20"
              >
                <Heart
                  className={`h-4 w-4 ${
                    favoriteIds.includes(activeExercise.id)
                      ? 'fill-pink-500 text-pink-500'
                      : 'text-slate-300'
                  }`}
                />
              </button>
              <button
                onClick={() => {
                  setActiveExercise(null);
                  setIsGuidedMode(false);
                }}
                className="rounded-xl bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 className="pr-16 text-lg font-extrabold text-white">{activeExercise.name}</h2>
            <p className="mt-0.5 text-xs font-bold text-sky-400">
              {activeExercise.muscle_group} • {activeExercise.equipment} • {activeExercise.sets_reps}
            </p>

            {isGuidedMode ? (
              <div className="mt-4">
                <GuidedExercisePlayer
                  exercise={activeExercise}
                  onExit={() => {
                    setIsGuidedMode(false);
                    earnXp(50);
                  }}
                />
              </div>
            ) : (
              <>
                <ExerciseAnimator
                  name={activeExercise.name}
                  frame1={activeExercise.media_url}
                  frame2={activeExercise.media_url_2}
                />

                <button
                  onClick={() => setIsGuidedMode(true)}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 py-3 text-xs font-extrabold text-white shadow-lg shadow-sky-500/20 hover:brightness-110"
                >
                  <Play className="h-3.5 w-3.5 fill-white" /> Start Exercise
                </button>

                {activeExercise.long_description && (
                  <div className="matte-box-soft mt-4 rounded-2xl p-3.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                      Overview
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {activeExercise.long_description}
                    </p>
                  </div>
                )}

                {activeExercise.benefits && activeExercise.benefits.length > 0 && (
                  <div className="matte-box-soft mt-3 rounded-2xl p-3.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      Benefits
                    </h3>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                      {activeExercise.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeExercise.results_timeline && (
                  <div className="matte-box-soft mt-3 rounded-2xl p-3.5">
                    <h3 className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-pink-400">
                      <Calendar className="h-3.5 w-3.5" /> Timeline
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {activeExercise.results_timeline}
                    </p>
                  </div>
                )}

                <h3 className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Steps
                </h3>
                <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs text-slate-300">
                  {activeExercise.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>

                {activeExercise.safety_note && (
                  <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                    <strong>Safety:</strong> {activeExercise.safety_note}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <InteractiveToolModal
        tool={quickTool}
        onClose={() => setQuickTool(null)}
        onEarnXp={earnXp}
      />

      <LevelGuideModal selectedLevel={guideLevel} onClose={() => setGuideLevel(null)} />
      <BloomCoach />
    </main>
  );
}