'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Dumbbell,
  ShieldCheck,
  X,
  PlayCircle,
  HeartPulse,
  Sparkles,
  Home,
  Info,
  ArrowRight,
  ArrowLeft,
  Zap,
  Users,
  Activity,
  Droplets,
  Flame,
  Sun,
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

type NavTab = 'home' | 'maintainer' | 'exercises' | 'studio' | 'about';
type ExerciseStep = 1 | 2 | 3;

export default function HomePage() {
  const [activeNav, setActiveNav] = useState<NavTab>('home');
  const [exerciseStep, setExerciseStep] = useState<ExerciseStep>(1);
  const [studioCategory, setStudioCategory] = useState<ToolCategory>('All');
  const [quickTool, setQuickTool] = useState<WellnessTool | null>(null);
  const [xp, setXp] = useState<number>(0);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Wizard Filters
  const [search, setSearch] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('18-39');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<string>('all');

  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [guideLevel, setGuideLevel] = useState<LevelKey | null>(null);

  useEffect(() => {
    const savedXp = localStorage.getItem('fitlife_xp');
    if (savedXp) setXp(Number(savedXp));
  }, []);

  const earnXp = (pts: number) => {
    setXp((prev) => {
      const next = prev + pts;
      localStorage.setItem('fitlife_xp', String(next));
      return next;
    });
  };

  useEffect(() => {
    const fetchAllExercises = async () => {
      const [res1, res2, res3] = await Promise.all([
        supabase.from('exercises').select('*').order('name').range(0, 999),
        supabase.from('exercises').select('*').order('name').range(1000, 1999),
        supabase.from('exercises').select('*').order('name').range(2000, 2999),
      ]);

      if (res1.error) {
        setDbError(res1.error.message);
      } else {
        const combined = [
          ...(res1.data || []),
          ...(res2.data || []),
          ...(res3.data || []),
        ] as Exercise[];
        setExercises(combined);
      }
      setLoading(false);
    };
    fetchAllExercises();
  }, []);

  const activeBodyGroup = BODY_PART_CATEGORIES.find((b) => b.id === selectedBodyPart);
  const activeGoalObj = TARGET_GOALS.find((g) => g.id === selectedGoal);
  const activeTimeObj = TIME_OF_DAY_OPTIONS.find((t) => t.id === selectedTime);

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
      } else {
        if (selectedAge === '18-39') {
          const isInfantOnly = ex.age_groups.length === 1 && ex.age_groups[0] === '0-2';
          if (isInfantOnly) return false;
        } else if (selectedAge !== 'all') {
          if (!ex.age_groups.includes(selectedAge)) return false;
        }
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

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-sky-100/90 via-indigo-50/75 to-pink-50/85 text-slate-800">
      {/* Animated Welcome Harsh..... Splash */}
      <WelcomeSplash />

      {/* Decorative Ambient Background Orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-300/35 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[28rem] w-[28rem] rounded-full bg-violet-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-teal-200/35 blur-3xl" />
      </div>

      {/* STICKY GLASSY COLORFUL NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 border-b border-white/80 bg-white/75 shadow-lg shadow-sky-200/40 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <button
            onClick={() => setActiveNav('home')}
            className="flex items-center gap-3 text-left transition hover:scale-[1.02]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white shadow-lg shadow-sky-200/80">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
                FitLife{' '}
                <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
                  0–90
                </span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">
                Wellness Studio
              </p>
            </div>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'maintainer', label: 'Maintainer', icon: HeartPulse },
              { id: 'exercises', label: 'All Exercises', icon: Dumbbell },
              { id: 'studio', label: '99+ Tools', icon: Layers, badge: '99' },
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
                    } else if (item.id === 'studio') {
                      setStudioCategory('All');
                      setActiveNav('studio');
                    } else {
                      setActiveNav(item.id as NavTab);
                    }
                  }}
                  className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white shadow-lg shadow-sky-200/80'
                      : 'border border-white bg-white/80 text-slate-600 shadow-sm hover:-translate-y-0.5 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                  {item.badge && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                        isActive ? 'bg-white text-indigo-600' : 'bg-pink-100 text-rose-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* =========================================================
          PAGE 1: HOME (SMOOTH PASTEL AURORA, BLURRED SHADOWS)
         ========================================================= */}
      {activeNav === 'home' && (
        <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-gradient-to-br from-white/90 via-sky-50/85 to-pink-50/75 p-8 shadow-2xl shadow-sky-200/60 backdrop-blur-xl sm:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-100 via-indigo-100 to-pink-100 px-4 py-1.5 text-xs font-bold text-indigo-700">
                    <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                    Welcome Harsh • 99+ Health &amp; Workout Tools
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-3 py-1.5 text-xs font-extrabold text-amber-800">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" /> {xp} XP
                  </span>
                </div>

                <h2 className="mt-5 text-4xl font-extrabold leading-[1.14] tracking-tight text-slate-800 sm:text-5xl">
                  Move Better. <br />
                  Glow Stronger. <br />
                  <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
                    Every Age, 0 to 90.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-slate-500">
                  A calm, uplifting wellness space designed for the whole family—featuring live animated form, hourly body maintenance, 99+ calculators &amp; timers, and your personal 🥷 &amp; 🌸 AI Coaches.
                </p>

                <div className="mt-8 flex flex-wrap gap-3.5">
                  <button
                    onClick={openExercisesWizard}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-200/80 transition-all hover:-translate-y-0.5 hover:brightness-105"
                  >
                    Explore All Exercises <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveNav('studio')}
                    className="flex items-center gap-2 rounded-2xl border border-white bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-3.5 text-sm font-bold text-indigo-700 shadow-lg shadow-indigo-100/80 transition-all hover:-translate-y-0.5 hover:brightness-105"
                  >
                    <Layers className="h-4 w-4" /> Open 99+ Tools Studio
                  </button>
                  <button
                    onClick={() => setActiveNav('maintainer')}
                    className="flex items-center gap-2 rounded-2xl border border-white bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-3.5 text-sm font-bold text-rose-600 shadow-lg shadow-pink-100/80 transition-all hover:-translate-y-0.5 hover:brightness-105"
                  >
                    <HeartPulse className="h-4 w-4" /> Maintainer Hub
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative rounded-3xl border border-white/60 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 p-6 text-white shadow-2xl shadow-indigo-200/80">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur">
                      Daily Wellness Pulse
                    </span>
                    <Sun className="h-5 w-5 text-amber-200" />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setActiveNav('maintainer')}
                      className="cursor-pointer rounded-2xl bg-white/15 p-4 backdrop-blur-md transition hover:bg-white/25"
                    >
                      <Droplets className="h-5 w-5 text-cyan-200" />
                      <p className="mt-2 text-xs font-medium text-sky-100">Hydration</p>
                      <p className="text-lg font-extrabold">Hourly Sync</p>
                    </div>
                    <div
                      onClick={() => setActiveNav('studio')}
                      className="cursor-pointer rounded-2xl bg-white/15 p-4 backdrop-blur-md transition hover:bg-white/25"
                    >
                      <Flame className="h-5 w-5 text-amber-200" />
                      <p className="mt-2 text-xs font-medium text-sky-100">99+ Calculators</p>
                      <p className="text-lg font-extrabold">1RM • BMI • HIIT</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-between rounded-2xl bg-white/20 p-4 backdrop-blur-md">
                      <div>
                        <p className="text-xs font-semibold text-sky-100">Dual AI Coaches Ready</p>
                        <p className="mt-0.5 text-sm font-extrabold">🥷 Male Ninja &amp; 🌸 Female</p>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg shadow-md">
                        ✨
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 12 INSTANT HEALTH & WORKOUT QUICK-LAUNCH WIDGETS */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Instant Interactive Widgets
                </p>
                <h3 className="mt-1 text-2xl font-extrabold text-slate-800">
                  Quick Health &amp; Workout Tools
                </h3>
              </div>
              <button
                onClick={() => setActiveNav('studio')}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                Explore all 99 tools →
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredQuickTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setQuickTool(tool)}
                  className="group flex items-start gap-3 rounded-3xl border border-white/90 bg-white/85 p-4 text-left shadow-lg shadow-sky-200/45 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-pink-100 text-lg">
                    {tool.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800 group-hover:text-sky-600">
                      {tool.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] font-medium text-slate-500">
                      {tool.tagline}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 8 CATEGORIES OF THE 99+ STUDIO */}
          <section className="rounded-[2rem] border border-white/90 bg-white/85 p-7 shadow-2xl shadow-indigo-200/50 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-rose-500">
                  8 Wellness Categories
                </p>
                <h3 className="mt-1 text-2xl font-extrabold text-slate-800">
                  Browse All 99 Health &amp; Fitness Features
                </h3>
              </div>
              <button
                onClick={() => setActiveNav('studio')}
                className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-200/80 hover:brightness-105"
              >
                Open Full 99+ Directory
              </button>
            </div>

            <div className="mt-5 grid gap-3.5 sm:grid-cols-2 md:grid-cols-4">
              {TOOL_CATEGORIES.filter((c) => c.id !== 'All').map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setStudioCategory(c.id);
                    setActiveNav('studio');
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-white bg-gradient-to-r from-sky-50/90 to-indigo-50/80 p-4 text-left shadow-md shadow-sky-100/60 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">{c.label}</p>
                    <p className="text-[10px] font-bold text-sky-600">Click to launch →</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Interactive Life-Stage Journey */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-sky-600">
                  Tailored By Life Stage
                </p>
                <h3 className="mt-1 text-2xl font-extrabold text-slate-800">
                  Choose Your Age Journey
                </h3>
              </div>
              <button
                onClick={openExercisesWizard}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                View full library →
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  id: '0-2',
                  title: 'Infants & Kids',
                  ages: '0 – 12 yrs',
                  desc: 'Playful motor drills, balance & joyful movement.',
                  icon: Baby,
                  grad: 'from-cyan-50/90 to-sky-100/80',
                  shadow: 'shadow-xl shadow-cyan-200/50',
                  badge: 'bg-cyan-500 text-white',
                },
                {
                  id: '13-17',
                  title: 'Teens & Youth',
                  ages: '13 – 17 yrs',
                  desc: 'Athletic agility, posture & safe bodyweight strength.',
                  icon: Zap,
                  grad: 'from-violet-50/90 to-indigo-100/80',
                  shadow: 'shadow-xl shadow-indigo-200/50',
                  badge: 'bg-indigo-500 text-white',
                },
                {
                  id: '18-39',
                  title: 'Adults & Prime',
                  ages: '18 – 59 yrs',
                  desc: 'Full gym, dumbbell, calisthenics & cardio mastery.',
                  icon: Award,
                  grad: 'from-pink-50/90 to-rose-100/80',
                  shadow: 'shadow-xl shadow-pink-200/50',
                  badge: 'bg-rose-500 text-white',
                },
                {
                  id: '60-74',
                  title: 'Seniors & Care',
                  ages: '60 – 90 yrs',
                  desc: 'Gentle chair mobility, joints & balance longevity.',
                  icon: Smile,
                  grad: 'from-emerald-50/90 to-teal-100/80',
                  shadow: 'shadow-xl shadow-teal-200/50',
                  badge: 'bg-teal-500 text-white',
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={() => jumpToAge(card.id)}
                    className={`group cursor-pointer rounded-3xl border border-white/90 bg-gradient-to-br ${card.grad} p-6 ${card.shadow} transition-all duration-300 hover:-translate-y-1.5`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${card.badge}`}>
                        {card.ages}
                      </span>
                      <Icon className="h-5 w-5 text-slate-600 transition group-hover:scale-110" />
                    </div>
                    <h4 className="mt-4 text-lg font-extrabold text-slate-800">{card.title}</h4>
                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Smooth Feature Bento Cards */}
          <section className="grid gap-6 md:grid-cols-3">
            <div
              onClick={openExercisesWizard}
              className="group cursor-pointer rounded-3xl border border-white/90 bg-white/85 p-6 shadow-xl shadow-sky-200/50 backdrop-blur-xl transition-all hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-200/80">
                <PlayCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-slate-800 group-hover:text-sky-600">
                Live Animated Form
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Smooth start-to-peak motion playback, inhale/exhale cues, live rep counter, and instant guided sessions.
              </p>
            </div>

            <div
              onClick={() => setActiveNav('maintainer')}
              className="group cursor-pointer rounded-3xl border border-white/90 bg-white/85 p-6 shadow-xl shadow-indigo-200/50 backdrop-blur-xl transition-all hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 text-white shadow-lg shadow-indigo-200/80">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-slate-800 group-hover:text-indigo-600">
                Full Body Maintainer
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Calculate BMI, calories, macros, water, sleep, and follow your hourly body needs with live reminders.
              </p>
            </div>

            <div
              onClick={() => setActiveNav('about')}
              className="group cursor-pointer rounded-3xl border border-white/90 bg-white/85 p-6 shadow-xl shadow-pink-200/50 backdrop-blur-xl transition-all hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-200/80">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-slate-800 group-hover:text-rose-600">
                🥷 &amp; 🌸 AI Coaches
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Switch between your Male Ninja or Female AI Coach anytime in the bottom-right corner for instant help.
              </p>
            </div>
          </section>

          {/* Trusted Level Playbooks Banner */}
          <section className="rounded-[2rem] border border-white/60 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 p-8 text-white shadow-2xl shadow-indigo-200/80">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur">
                  <Star className="h-3.5 w-3.5 text-amber-200" /> Readiness Verified
                </span>
                <h3 className="mt-3 text-2xl font-extrabold">Trusted Level Playbooks</h3>
                <p className="mt-1 max-w-xl text-sm font-medium text-sky-100">
                  Take a quick readiness check to unlock the safest weekly split matched to your current strength.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {(['Beginner', 'Intermediate', 'Advanced'] as LevelKey[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setGuideLevel(lvl)}
                    className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-extrabold text-indigo-700 shadow-lg shadow-indigo-900/15 transition hover:-translate-y-0.5 hover:bg-sky-50"
                  >
                    <ShieldCheck className="h-4 w-4 text-sky-500" />
                    {lvl} Guide
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================
          PAGE 2: MAINTAINER (ALL HEALTH MEASURING TOOLS)
         ========================================================= */}
      {activeNav === 'maintainer' && <MaintainerView />}

      {/* =========================================================
          PAGE 3: ALL EXERCISES — STEP-BY-STEP WIZARD (1 -> 2 -> 3)
         ========================================================= */}
      {activeNav === 'exercises' && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { step: 1 as ExerciseStep, label: '1. Body Part' },
              { step: 2 as ExerciseStep, label: '2. Target & Time' },
              { step: 3 as ExerciseStep, label: '3. Your Exercises' },
            ].map((s) => (
              <button
                key={s.step}
                onClick={() => setExerciseStep(s.step)}
                className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
                  exerciseStep === s.step
                    ? 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white shadow-lg shadow-sky-200/80'
                    : exerciseStep > s.step
                    ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                    : 'border border-white bg-white/80 text-slate-400 shadow-sm'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {exerciseStep === 1 && (
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/90 bg-white/85 p-8 shadow-2xl shadow-sky-200/60 backdrop-blur-xl">
              <div className="text-center">
                <span className="inline-block rounded-full bg-sky-100 px-4 py-1 text-xs font-bold text-sky-700">
                  Step 1 of 2
                </span>
                <h2 className="mt-3 text-3xl font-extrabold text-slate-800">
                  Which Body Part Do You Want to Train?
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Select a body part below—you can also narrow down to a specific A–Z muscle.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
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
                      className={`group flex flex-col items-center rounded-3xl border p-6 text-center transition-all duration-200 hover:-translate-y-1 ${
                        isSelected
                          ? 'border-sky-300 bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-xl shadow-sky-200/80'
                          : 'border-white bg-sky-50/70 text-slate-700 shadow-lg shadow-sky-100/60 hover:bg-sky-100/70'
                      }`}
                    >
                      <span className="text-3xl">{bp.emoji}</span>
                      <span className="mt-3 text-sm font-extrabold">{bp.label}</span>
                      {bp.muscles.length > 1 && (
                        <span
                          className={`mt-1 text-[10px] font-semibold ${
                            isSelected ? 'text-sky-100' : 'text-sky-600'
                          }`}
                        >
                          {bp.muscles.length} A–Z muscles
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {activeBodyGroup && activeBodyGroup.muscles.length > 1 && (
                <div className="mt-8 rounded-3xl border border-indigo-100 bg-indigo-50/70 p-5 shadow-inner">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Optional: Pick a Specific {activeBodyGroup.label} Muscle (A–Z)
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedMuscle('all');
                        setExerciseStep(2);
                      }}
                      className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                        selectedMuscle === 'all'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white text-indigo-800 shadow-sm hover:bg-indigo-100'
                      }`}
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
                        className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                          selectedMuscle === m
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-indigo-800 shadow-sm hover:bg-indigo-100'
                        }`}
                      >
                        {m} →
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setExerciseStep(2)}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-200/80 transition hover:-translate-y-0.5"
                >
                  Next: Choose Target Goal <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {exerciseStep === 2 && (
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/90 bg-white/85 p-8 shadow-2xl shadow-pink-200/50 backdrop-blur-xl">
              <div className="text-center">
                <span className="inline-block rounded-full bg-pink-100 px-4 py-1 text-xs font-bold text-rose-700">
                  Step 2 of 2 • {activeBodyGroup?.emoji} {activeBodyGroup?.label}
                  {selectedMuscle !== 'all' ? ` (${selectedMuscle})` : ''}
                </span>
                <h2 className="mt-3 text-3xl font-extrabold text-slate-800">
                  Choose Your Target Goal &amp; Time of Day
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Pick how you want to train and when you are working out today.
                </p>
              </div>

              <div className="mt-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-rose-500">
                  Target Goal
                </p>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {TARGET_GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGoal(g.id)}
                      className={`rounded-3xl border p-4 text-left transition-all ${
                        selectedGoal === g.id
                          ? 'border-rose-300 bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-xl shadow-pink-200/80'
                          : 'border-white bg-pink-50/60 text-slate-700 shadow-md shadow-pink-100/50 hover:bg-pink-100/70'
                      }`}
                    >
                      <p className="text-sm font-extrabold">{g.label}</p>
                      {g.tip && (
                        <p
                          className={`mt-1 text-[11px] font-medium ${
                            selectedGoal === g.id ? 'text-pink-100' : 'text-slate-500'
                          }`}
                        >
                          {g.tip}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-teal-600">
                  Time of Day
                </p>
                <div className="grid gap-3 sm:grid-cols-5">
                  {TIME_OF_DAY_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTime(t.id)}
                      className={`flex flex-col items-center rounded-3xl border p-3.5 text-center transition-all ${
                        selectedTime === t.id
                          ? 'border-teal-300 bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow-xl shadow-teal-200/80'
                          : 'border-white bg-teal-50/60 text-slate-700 shadow-md shadow-teal-100/50 hover:bg-teal-100/70'
                      }`}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <span className="mt-1 text-xs font-extrabold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setExerciseStep(1)}
                  className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-3 text-xs font-bold text-sky-800 hover:bg-sky-100"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Body Parts
                </button>
                <button
                  onClick={() => {
                    setVisibleCount(24);
                    setExerciseStep(3);
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-200/80 transition hover:-translate-y-0.5"
                >
                  Show My Exercises <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {exerciseStep === 3 && (
            <div>
              <div className="rounded-3xl border border-white/90 bg-white/85 p-5 shadow-xl shadow-sky-200/50 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setExerciseStep(2)}
                      className="flex items-center gap-1 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                    <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-800">
                      {activeBodyGroup?.emoji} {activeBodyGroup?.label}
                      {selectedMuscle !== 'all' ? `: ${selectedMuscle}` : ''}
                    </span>
                    <span className="rounded-full bg-pink-100 px-3 py-1.5 text-xs font-bold text-rose-700">
                      {activeGoalObj?.label}
                    </span>
                    <span className="rounded-full bg-teal-100 px-3 py-1.5 text-xs font-bold text-teal-800">
                      {activeTimeObj?.emoji} {activeTimeObj?.label}
                    </span>
                  </div>

                  <button
                    onClick={resetAllFilters}
                    className="flex items-center gap-1.5 rounded-2xl border border-rose-100 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Start Over
                  </button>
                </div>

                {activeGoalObj?.tip && (
                  <p className="mt-3 text-xs font-bold text-rose-500">
                    Recommended Tempo: {activeGoalObj.tip}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-sky-500" />
                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setVisibleCount(24);
                      }}
                      placeholder="Search inside these exercises..."
                      className="w-full rounded-2xl border border-sky-100 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 shadow-sm outline-none focus:border-sky-300"
                    />
                  </div>

                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="rounded-2xl border border-sky-100 bg-sky-50/80 px-3 py-2.5 text-xs font-bold text-sky-900 outline-none"
                  >
                    {AGE_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-1 rounded-2xl border border-sky-100 bg-sky-50/70 p-1">
                    {['All', 'Male', 'Female'].map((gen) => (
                      <button
                        key={gen}
                        onClick={() => setSelectedGender(gen)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                          selectedGender === gen
                            ? 'bg-sky-500 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-white'
                        }`}
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading ? (
                <p className="mt-12 text-center text-sm font-bold text-sky-700">
                  Loading your workout library...
                </p>
              ) : dbError ? (
                <p className="mt-12 text-center text-sm font-bold text-rose-600">
                  Supabase Error: {dbError}
                </p>
              ) : filtered.length === 0 ? (
                <div className="mt-12 text-center">
                  <p className="text-sm font-bold text-slate-600">
                    No exercises matched this exact combination.
                  </p>
                  <button
                    onClick={() => setExerciseStep(2)}
                    className="mt-3 rounded-2xl bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-200"
                  >
                    Change Target Goal or Time
                  </button>
                </div>
              ) : (
                <>
                  <p className="mt-6 text-xs font-bold uppercase tracking-wider text-sky-700">
                    Showing {visibleExercises.length} of {filtered.length} matching workouts — click any card for live guide &amp; animation
                  </p>
                  <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleExercises.map((ex) => (
                      <div
                        key={ex.id}
                        onClick={() => {
                          setActiveExercise(ex);
                          setIsGuidedMode(false);
                        }}
                        className="group cursor-pointer overflow-hidden rounded-3xl border border-white/90 bg-white/85 shadow-xl shadow-sky-200/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-200/60"
                      >
                        <div className="relative h-48 w-full overflow-hidden bg-sky-50">
                          {ex.media_url && (
                            <img
                              src={ex.media_url}
                              alt={ex.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          )}
                          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-sky-700 shadow-md">
                            <PlayCircle className="h-3.5 w-3.5 text-sky-500" /> Live Animation
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-sky-700">
                              {ex.level}
                            </span>
                            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-indigo-700">
                              {ex.muscle_group}
                            </span>
                            <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-rose-600">
                              {ex.equipment}
                            </span>
                          </div>
                          <h3 className="mt-2.5 text-lg font-extrabold text-slate-800 group-hover:text-sky-600">
                            {ex.name}
                          </h3>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            Ages: {ex.age_groups.join(', ')} • {ex.sets_reps}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {visibleCount < filtered.length && (
                    <div className="mt-10 text-center">
                      <button
                        onClick={() => setVisibleCount((c) => c + 24)}
                        className="rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-200/80 transition hover:-translate-y-0.5"
                      >
                        Load More Workouts ({filtered.length - visibleCount} remaining)
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
          PAGE 4: 99+ WELLNESS & WORKOUT STUDIO HUB
         ========================================================= */}
      {activeNav === 'studio' && (
        <WellnessStudioHub
          xp={xp}
          onEarnXp={earnXp}
          initialCategory={studioCategory}
        />
      )}

      {/* =========================================================
          PAGE 5: ABOUT (UNIFIED SMOOTH PASTEL DESIGN)
         ========================================================= */}
      {activeNav === 'about' && (
        <section className="mx-auto max-w-4xl space-y-8 px-4 py-12">
          <div className="rounded-[2rem] border border-white/90 bg-white/85 p-8 shadow-2xl shadow-sky-200/60 backdrop-blur-xl sm:p-10">
            <span className="inline-block rounded-full bg-gradient-to-r from-sky-100 to-pink-100 px-4 py-1.5 text-xs font-bold text-indigo-700">
              About FitLife 0–90
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-800">
              One Lovely Fitness Standard for Every Generation
            </h2>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">
              FitLife 0–90 brings together guided exercises, 99+ interactive health &amp; workout calculators, live breathing/interval timers, hourly body maintenance, and dual AI coaches in one calm, colorful interface.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-3xl border border-white bg-gradient-to-br from-sky-50 to-indigo-50 p-6 shadow-lg shadow-sky-100/70">
                <h3 className="text-base font-extrabold text-indigo-900">🥷 Male Ninja &amp; 🌸 Female AI</h3>
                <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
                  Choose your preferred AI coach persona anytime for instant form corrections, custom splits, and age-safe modifications.
                </p>
              </div>
              <div className="rounded-3xl border border-white bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-lg shadow-pink-100/70">
                <h3 className="text-base font-extrabold text-rose-900">✨ 99+ Tools &amp; Maintainer</h3>
                <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
                  Track BMI, 1RM, macros, water intake, sleep cycles, posture resets, and hourly body needs in one place.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Exercise Details + Guided Mode Modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md">
          <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-white/90 bg-white/95 p-6 text-slate-800 shadow-2xl shadow-sky-200/70 backdrop-blur-xl">
            <button
              onClick={() => {
                setActiveExercise(null);
                setIsGuidedMode(false);
              }}
              className="absolute right-4 top-4 rounded-2xl bg-sky-50 p-2 text-slate-500 hover:bg-sky-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="pr-10 text-xl font-extrabold text-slate-800">{activeExercise.name}</h2>
            <p className="mt-1 text-xs font-bold text-sky-600">
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
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-200/80 transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  <Play className="h-4 w-4 fill-white" /> Start This Exercise (Live Guide &amp; Counter)
                </button>

                {activeExercise.long_description && (
                  <div className="mt-5 rounded-3xl border border-sky-100 bg-sky-50/60 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700">
                      Full Description
                    </h3>
                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600">
                      {activeExercise.long_description}
                    </p>
                  </div>
                )}

                {activeExercise.benefits && activeExercise.benefits.length > 0 && (
                  <div className="mt-4 rounded-3xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                      What You Will Get From Doing This
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs font-semibold text-slate-600">
                      {activeExercise.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeExercise.results_timeline && (
                  <div className="mt-4 rounded-3xl border border-pink-100 bg-pink-50/70 p-4">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600">
                      <Calendar className="h-3.5 w-3.5" /> How Many Days to See Results
                    </h3>
                    <p className="mt-1.5 text-xs font-semibold leading-relaxed text-rose-800">
                      {activeExercise.results_timeline}
                    </p>
                  </div>
                )}

                <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  How to Perform
                </h3>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm font-medium text-slate-600">
                  {activeExercise.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>

                {activeExercise.safety_note && (
                  <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-bold text-amber-800">
                    <strong>Safety:</strong> {activeExercise.safety_note}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Tool Modal from Homepage */}
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