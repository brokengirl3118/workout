'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Dumbbell, ShieldCheck, X, PlayCircle, HeartPulse, Sparkles } from 'lucide-react';
import { supabase, Exercise } from '@/lib/supabase';
import { AGE_GROUPS, LevelKey } from '@/lib/data';
import LevelGuideModal from '@/components/LevelGuideModal';
import BloomCoach from '@/components/BloomCoach';
import ExerciseAnimator from '@/components/ExerciseAnimator';
import HealthTrackerModal from '@/components/HealthTrackerModal';

export default function HomePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('18-39');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [guideLevel, setGuideLevel] = useState<LevelKey | null>(null);
  const [healthOpen, setHealthOpen] = useState(false);

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
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/40 to-white text-slate-800">
      {/* Hero + Global Search */}
      <header className="border-b border-sky-100 bg-white/80 px-4 py-10 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-200">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  FitLife <span className="text-sky-600">0–90</span>
                </h1>
                <p className="flex items-center gap-1 text-xs font-medium text-sky-600">
                  <Sparkles className="h-3.5 w-3.5" /> Complete Fitness & Wellness Guide
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setHealthOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-200 transition hover:brightness-105"
              >
                <HeartPulse className="h-4 w-4" />
                Health & Hourly Tracker
              </button>

              {(['Beginner', 'Intermediate', 'Advanced'] as LevelKey[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setGuideLevel(lvl)}
                  className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50/70 px-3.5 py-2.5 text-xs font-bold text-sky-800 transition hover:border-sky-400 hover:bg-sky-100"
                >
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                  {lvl} Guide
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm text-slate-600">
            Guided workouts with live animations for infants, kids, teens, men, women, and seniors across every stage of life.
          </p>

          {/* Global Search Bar */}
          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-sky-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(24);
              }}
              placeholder="Search any exercise across all ages (e.g., Bench Press, Chair, Squat, Frog Jump)..."
              className="w-full rounded-2xl border border-sky-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
          </div>
        </div>
      </header>

      {/* Age Tabs & Gender Filter */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setSearch('');
                  setSelectedAge(g.id);
                  setVisibleCount(24);
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  selectedAge === g.id && !search
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200'
                    : 'border border-sky-100 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 rounded-xl border border-sky-100 bg-white p-1 shadow-sm">
            {['All', 'Male', 'Female'].map((gen) => (
              <button
                key={gen}
                onClick={() => setSelectedGender(gen)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedGender === gen
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                {gen}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Grid */}
        {loading ? (
          <p className="mt-12 text-center text-sm font-medium text-sky-600">
            Loading your workout library...
          </p>
        ) : dbError ? (
          <p className="mt-12 text-center text-sm font-semibold text-rose-500">
            Supabase Error: {dbError}
          </p>
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-slate-500">
            No exercises found. Try another search or age group.
          </p>
        ) : (
          <>
            <p className="mt-5 text-xs font-medium text-slate-500">
              Showing {visibleExercises.length} of {filtered.length} matching workouts — click any card for live animation
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setActiveExercise(ex)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100"
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
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-sky-700 shadow-sm backdrop-blur">
                      <PlayCircle className="h-3.5 w-3.5 text-sky-500" /> Live Animation
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                      <span className="rounded-lg bg-sky-100 px-2.5 py-0.5 text-sky-700">
                        {ex.level}
                      </span>
                      <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-blue-700">
                        {ex.muscle_group}
                      </span>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-slate-600">
                        {ex.equipment}
                      </span>
                    </div>
                    <h3 className="mt-2.5 text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
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
                  className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-sky-200 transition hover:brightness-105"
                >
                  Load More Workouts ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Exercise Details + Live Animation Modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-sky-100 bg-white p-6 text-slate-800 shadow-2xl">
            <button
              onClick={() => setActiveExercise(null)}
              className="absolute right-4 top-4 rounded-xl bg-sky-50 p-2 text-slate-500 transition hover:bg-sky-100 hover:text-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="pr-10 text-xl font-extrabold text-slate-900">{activeExercise.name}</h2>
            <p className="mt-1 text-xs font-semibold text-sky-600">
              {activeExercise.muscle_group} • {activeExercise.equipment} • {activeExercise.sets_reps}
            </p>

            <ExerciseAnimator
              name={activeExercise.name}
              frame1={activeExercise.media_url}
              frame2={activeExercise.media_url_2}
            />

            <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
              How to Perform
            </h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
              {activeExercise.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {activeExercise.safety_note && (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
                <strong>Safety:</strong> {activeExercise.safety_note}
              </p>
            )}
          </div>
        </div>
      )}

      <LevelGuideModal selectedLevel={guideLevel} onClose={() => setGuideLevel(null)} />
      <HealthTrackerModal open={healthOpen} onClose={() => setHealthOpen(false)} />
      <BloomCoach />
    </main>
  );
}