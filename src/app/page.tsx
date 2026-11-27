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
  Zap,
  Users,
  Activity,
} from 'lucide-react';
import { supabase, Exercise } from '@/lib/supabase';
import { AGE_GROUPS, LevelKey } from '@/lib/data';
import LevelGuideModal from '@/components/LevelGuideModal';
import BloomCoach from '@/components/BloomCoach';
import ExerciseAnimator from '@/components/ExerciseAnimator';
import MaintainerView from '@/components/MaintainerView';

type NavTab = 'home' | 'maintainer' | 'exercises' | 'about';

export default function HomePage() {
  const [activeNav, setActiveNav] = useState<NavTab>('home');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('18-39');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [guideLevel, setGuideLevel] = useState<LevelKey | null>(null);

  useEffect(() => {
    const fetchAllExercises = async () => {
      const [res1, res2] = await Promise.all([
        supabase.from('exercises').select('*').order('name').range(0, 999),
        supabase.from('exercises').select('*').order('name').range(1000, 1999),
      ]);

      if (res1.error) {
        setDbError(res1.error.message);
      } else {
        const combined = [...(res1.data || []), ...(res2.data || [])] as Exercise[];
        setExercises(combined);
      }
      setLoading(false);
    };
    fetchAllExercises();
  }, []);

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
      return true;
    });
  }, [exercises, search, selectedAge, selectedGender]);

  const visibleExercises = filtered.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-sky-50 bg-[radial-gradient(#bae6fd_1.5px,transparent_1.5px)] [background-size:24px_24px] text-slate-900">
      {/* STICKY DIGITAL NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 border-b-2 border-sky-900 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          {/* Brand Logo */}
          <button
            onClick={() => setActiveNav('home')}
            className="flex items-center gap-2.5 text-left transition hover:scale-[1.02]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-sky-900 bg-sky-400 text-white shadow-[3px_3px_0px_0px_#0c4a6e]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                FitLife <span className="text-sky-600">0–90</span>
              </h1>
            </div>
          </button>

          {/* 4 Main Navigation Links */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'maintainer', label: 'Maintainer', icon: HeartPulse },
              { id: 'exercises', label: 'All Exercises', icon: Dumbbell },
              { id: 'about', label: 'About', icon: Info },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id as NavTab)}
                  className={`flex items-center gap-1.5 rounded-xl border-2 border-sky-900 px-4 py-2 text-xs font-black transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-[4px_4px_0px_0px_#0c4a6e]'
                      : 'bg-sky-50 text-sky-950 shadow-[2px_2px_0px_0px_#bae6fd] hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-[4px_4px_0px_0px_#0284c7]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* =========================================================
          PAGE 1: HOME (NO EXERCISES SHOWN — DIGITALLY STYLISH)
         ========================================================= */}
      {activeNav === 'home' && (
        <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
          {/* Hero Digital Banner */}
          <section className="relative overflow-hidden rounded-3xl border-2 border-sky-900 bg-white p-8 shadow-[10px_10px_0px_0px_#0284c7] sm:p-12">
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-sky-900 bg-sky-200 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-sky-950 shadow-[3px_3px_0px_0px_#0c4a6e]">
                <Sparkles className="h-3.5 w-3.5" /> Next-Gen Fitness & Health Platform
              </span>
              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Train Smarter. Live Stronger. <br />
                <span className="inline-block rounded-xl bg-sky-200 px-3 py-0.5 text-sky-900">
                  Built for Ages 0 to 90.
                </span>
              </h2>
              <p className="mt-5 max-w-2xl text-base font-medium text-slate-600">
                Your complete digital wellness ecosystem—combining live animated workout form, hourly body maintenance tools, trusted level guides, and your personal 🥷 & 🌸 AI Coaches.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveNav('exercises')}
                  className="flex items-center gap-2 rounded-2xl border-2 border-sky-900 bg-sky-500 px-6 py-3.5 text-sm font-black text-white shadow-[5px_5px_0px_0px_#0c4a6e] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#0c4a6e]"
                >
                  Explore All Exercises <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveNav('maintainer')}
                  className="flex items-center gap-2 rounded-2xl border-2 border-sky-900 bg-sky-100 px-6 py-3.5 text-sm font-black text-sky-950 shadow-[5px_5px_0px_0px_#38bdf8] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#38bdf8]"
                >
                  <HeartPulse className="h-4 w-4 text-sky-700" /> Open Maintainer Hub
                </button>
              </div>
            </div>
          </section>

          {/* Digital Feature Bento Grid */}
          <section className="grid gap-6 md:grid-cols-3">
            <div
              onClick={() => setActiveNav('exercises')}
              className="group cursor-pointer rounded-3xl border-2 border-sky-900 bg-white p-6 shadow-[7px_7px_0px_0px_#38bdf8] transition-all hover:-translate-y-1 hover:shadow-[9px_9px_0px_0px_#0284c7]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-sky-900 bg-sky-200 text-sky-900 shadow-[3px_3px_0px_0px_#0c4a6e]">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900 group-hover:text-sky-600">
                Live Animated Form
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Every workout features smooth start-to-peak motion playback, breathing cues, rep counting, and live video demos.
              </p>
            </div>

            <div
              onClick={() => setActiveNav('maintainer')}
              className="group cursor-pointer rounded-3xl border-2 border-sky-900 bg-white p-6 shadow-[7px_7px_0px_0px_#0ea5e9] transition-all hover:-translate-y-1 hover:shadow-[9px_9px_0px_0px_#0284c7]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-sky-900 bg-blue-200 text-blue-900 shadow-[3px_3px_0px_0px_#0c4a6e]">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900 group-hover:text-sky-600">
                Full Body Maintainer
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Measure BMI, calories, macros, water, sleep, and follow your every-hour body schedule with live reminders.
              </p>
            </div>

            <div
              onClick={() => setActiveNav('about')}
              className="group cursor-pointer rounded-3xl border-2 border-sky-900 bg-white p-6 shadow-[7px_7px_0px_0px_#0284c7] transition-all hover:-translate-y-1 hover:shadow-[9px_9px_0px_0px_#0c4a6e]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-sky-900 bg-cyan-200 text-cyan-950 shadow-[3px_3px_0px_0px_#0c4a6e]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900 group-hover:text-sky-600">
                🥷 & 🌸 AI Coaches
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Pick your Male Ninja or Female AI Coach anytime from the bottom-right corner for instant global fitness guidance.
              </p>
            </div>
          </section>

          {/* Trusted Level Guides Section */}
          <section className="rounded-3xl border-2 border-sky-900 bg-sky-100/80 p-7 shadow-[8px_8px_0px_0px_#0c4a6e]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Trusted Level Playbooks</h3>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Take a quick readiness check to unlock the safest structured split for your current strength.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {(['Beginner', 'Intermediate', 'Advanced'] as LevelKey[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setGuideLevel(lvl)}
                    className="flex items-center gap-2 rounded-2xl border-2 border-sky-900 bg-white px-5 py-3 text-xs font-black text-sky-950 shadow-[4px_4px_0px_0px_#0284c7] transition-all hover:-translate-y-0.5 hover:bg-sky-500 hover:text-white"
                  >
                    <ShieldCheck className="h-4 w-4" />
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
          PAGE 3: ALL EXERCISES (FULL LIBRARY + LIVE ANIMATION)
         ========================================================= */}
      {activeNav === 'exercises' && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-3xl border-2 border-sky-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0284c7]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  All <span className="text-sky-600">Exercises</span>
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Search across every age group or filter by life stage and gender.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as LevelKey[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setGuideLevel(lvl)}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-sky-900 bg-sky-50 px-3 py-2 text-xs font-extrabold text-sky-950 shadow-[3px_3px_0px_0px_#38bdf8] hover:bg-sky-200"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="relative mt-6">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-sky-600" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(24);
                }}
                placeholder="Search any exercise across all ages (e.g., Bench Press, Chair, Squat, Frog Jump)..."
                className="w-full rounded-2xl border-2 border-sky-900 bg-sky-50/40 py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 shadow-[4px_4px_0px_0px_#bae6fd] outline-none placeholder:text-slate-400 focus:bg-white focus:shadow-[4px_4px_0px_0px_#0284c7]"
              />
            </div>

            {/* Age & Gender Filters */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSearch('');
                      setSelectedAge(g.id);
                      setVisibleCount(24);
                    }}
                    className={`rounded-xl border-2 border-sky-900 px-3.5 py-2 text-xs font-extrabold transition-all ${
                      selectedAge === g.id && !search
                        ? 'bg-sky-500 text-white shadow-[3px_3px_0px_0px_#0c4a6e]'
                        : 'bg-white text-slate-700 shadow-[2px_2px_0px_0px_#bae6fd] hover:bg-sky-50'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5 rounded-xl border-2 border-sky-900 bg-sky-50 p-1">
                {['All', 'Male', 'Female'].map((gen) => (
                  <button
                    key={gen}
                    onClick={() => setSelectedGender(gen)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
                      selectedGender === gen
                        ? 'bg-sky-900 text-white'
                        : 'text-sky-900 hover:bg-sky-200'
                    }`}
                  >
                    {gen}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exercise Grid */}
          {loading ? (
            <p className="mt-12 text-center text-sm font-bold text-sky-700">
              Loading your workout library...
            </p>
          ) : dbError ? (
            <p className="mt-12 text-center text-sm font-bold text-rose-600">
              Supabase Error: {dbError}
            </p>
          ) : filtered.length === 0 ? (
            <p className="mt-12 text-center text-sm font-bold text-slate-500">
              No exercises found. Try another search or age group.
            </p>
          ) : (
            <>
              <p className="mt-6 text-xs font-extrabold uppercase tracking-wider text-sky-800">
                Showing {visibleExercises.length} of {filtered.length} workouts — click any card for live animation
              </p>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleExercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => setActiveExercise(ex)}
                    className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-sky-900 bg-white shadow-[6px_6px_0px_0px_#38bdf8] transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#0284c7]"
                  >
                    <div className="relative h-48 w-full overflow-hidden border-b-2 border-sky-900 bg-sky-50">
                      {ex.media_url && (
                        <img
                          src={ex.media_url}
                          alt={ex.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full border-2 border-sky-900 bg-white px-3 py-1 text-[11px] font-black text-sky-900 shadow-[2px_2px_0px_0px_#0c4a6e]">
                        <PlayCircle className="h-3.5 w-3.5 text-sky-600" /> Live Animation
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-1.5 text-[11px] font-extrabold">
                        <span className="rounded-lg border border-sky-900 bg-sky-200 px-2 py-0.5 text-sky-950">
                          {ex.level}
                        </span>
                        <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-sky-800">
                          {ex.muscle_group}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">
                          {ex.equipment}
                        </span>
                      </div>
                      <h3 className="mt-2.5 text-lg font-black text-slate-900 group-hover:text-sky-600">
                        {ex.name}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
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
                    className="rounded-2xl border-2 border-sky-900 bg-sky-500 px-8 py-3.5 text-sm font-black text-white shadow-[5px_5px_0px_0px_#0c4a6e] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#0c4a6e]"
                  >
                    Load More Workouts ({filtered.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* =========================================================
          PAGE 4: ABOUT (TRENDY DIGITAL OVERVIEW)
         ========================================================= */}
      {activeNav === 'about' && (
        <section className="mx-auto max-w-4xl space-y-8 px-4 py-12">
          <div className="rounded-3xl border-2 border-sky-900 bg-white p-8 shadow-[9px_9px_0px_0px_#0284c7]">
            <span className="inline-block rounded-full border-2 border-sky-900 bg-sky-200 px-3.5 py-1 text-xs font-black uppercase text-sky-950">
              About FitLife 0–90
            </span>
            <h2 className="mt-4 text-3xl font-black text-slate-900">
              One Digital Fitness Standard for Every Generation
            </h2>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">
              FitLife 0–90 was built to remove guesswork from fitness and daily body care. Whether it is supervised motor play for infants, athletic foundations for teens, full strength & hypertrophy training for adults, or safe chair-assisted mobility for seniors, every movement is organized cleanly by age, equipment, and skill level.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-sky-900 bg-sky-50 p-5 shadow-[4px_4px_0px_0px_#38bdf8]">
                <h3 className="text-base font-black text-sky-950">🥷 Male Ninja & 🌸 Female AI</h3>
                <p className="mt-2 text-xs font-medium text-slate-600">
                  Choose your preferred AI coach persona anytime for instant form corrections, custom splits, and age-safe modifications.
                </p>
              </div>
              <div className="rounded-2xl border-2 border-sky-900 bg-sky-50 p-5 shadow-[4px_4px_0px_0px_#38bdf8]">
                <h3 className="text-base font-black text-sky-950">⚡ Body Maintainer</h3>
                <p className="mt-2 text-xs font-medium text-slate-600">
                  Track BMI, daily calories, macros, water intake, hourly body requirements, and real-time reminders in one place.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Exercise Details + Live Animation Modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 border-sky-900 bg-white p-6 text-slate-800 shadow-[10px_10px_0px_0px_#0284c7]">
            <button
              onClick={() => setActiveExercise(null)}
              className="absolute right-4 top-4 rounded-xl border-2 border-sky-900 bg-sky-50 p-1.5 text-sky-950 hover:bg-sky-200"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="pr-10 text-xl font-black text-slate-900">{activeExercise.name}</h2>
            <p className="mt-1 text-xs font-bold text-sky-600">
              {activeExercise.muscle_group} • {activeExercise.equipment} • {activeExercise.sets_reps}
            </p>

            <ExerciseAnimator
              name={activeExercise.name}
              frame1={activeExercise.media_url}
              frame2={activeExercise.media_url_2}
            />

            <h3 className="mt-5 text-xs font-black uppercase tracking-wider text-slate-400">
              How to Perform
            </h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm font-medium text-slate-700">
              {activeExercise.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {activeExercise.safety_note && (
              <p className="mt-4 rounded-2xl border-2 border-amber-500 bg-amber-50 p-3.5 text-xs font-bold text-amber-900">
                <strong>Safety:</strong> {activeExercise.safety_note}
              </p>
            )}
          </div>
        </div>
      )}

      <LevelGuideModal selectedLevel={guideLevel} onClose={() => setGuideLevel(null)} />
      <BloomCoach />
    </main>
  );
}