'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Dumbbell, ShieldCheck, X, PlayCircle } from 'lucide-react';
import { supabase, Exercise } from '@/lib/supabase';
import { AGE_GROUPS, LevelKey } from '@/lib/data';
import LevelGuideModal from '@/components/LevelGuideModal';
import BloomCoach from '@/components/BloomCoach';
import ExerciseAnimator from '@/components/ExerciseAnimator';

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

  useEffect(() => {
    const fetchAllExercises = async () => {
      // Fetch in 2 ranges so we get all 1,000+ rows past Supabase's 1,000-row default cap
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
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Dumbbell className="h-7 w-7 text-emerald-400" />
              <h1 className="text-2xl font-extrabold tracking-tight">
                FitLife <span className="text-emerald-400">0–90</span>
              </h1>
              {!loading && (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  {exercises.length} Exercises
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as LevelKey[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setGuideLevel(lvl)}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-400"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  {lvl} Guide
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            1,000+ genuine exercises with live animations for infants, kids, teens, men, women, and seniors (0–90 years).
          </p>

          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(24);
              }}
              placeholder="Search any of 1,000+ exercises across ALL ages (e.g., Bench Press, Chair, Squat, Frog Jump)..."
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
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
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 rounded-xl bg-zinc-900 p-1">
            {['All', 'Male', 'Female'].map((gen) => (
              <button
                key={gen}
                onClick={() => setSelectedGender(gen)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  selectedGender === gen ? 'bg-zinc-700 text-white' : 'text-zinc-400'
                }`}
              >
                {gen}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="mt-12 text-center text-sm text-zinc-400">Loading 1,000+ exercises from Supabase...</p>
        ) : dbError ? (
          <p className="mt-12 text-center text-sm text-rose-400">Supabase Error: {dbError}</p>
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-zinc-400">No exercises found. Try another search or age group.</p>
        ) : (
          <>
            <p className="mt-4 text-xs text-zinc-400">
              Showing {visibleExercises.length} of {filtered.length} matching exercises — click any card for live animation
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setActiveExercise(ex)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 transition hover:border-emerald-500/60"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-black">
                    {ex.media_url && (
                      <img
                        src={ex.media_url}
                        alt={ex.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      <PlayCircle className="h-3.5 w-3.5" /> Live Animation
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-400">
                        {ex.level}
                      </span>
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-zinc-300">
                        {ex.muscle_group}
                      </span>
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-zinc-400">
                        {ex.equipment}
                      </span>
                    </div>
                    <h3 className="mt-2.5 text-lg font-bold text-white">{ex.name}</h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Ages: {ex.age_groups.join(', ')} • {ex.sets_reps}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 24)}
                  className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-black hover:bg-emerald-400"
                >
                  Load More Exercises ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Exercise Details + Live Animation Modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <button
              onClick={() => setActiveExercise(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="pr-8 text-xl font-bold text-white">{activeExercise.name}</h2>
            <p className="mt-1 text-xs text-emerald-400">
              {activeExercise.muscle_group} • {activeExercise.equipment} • {activeExercise.sets_reps}
            </p>

            {/* Live Working Animation */}
            <ExerciseAnimator
              name={activeExercise.name}
              frame1={activeExercise.media_url}
              frame2={activeExercise.media_url_2}
            />

            <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-zinc-400">
              How to Perform
            </h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-zinc-200">
              {activeExercise.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {activeExercise.safety_note && (
              <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
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