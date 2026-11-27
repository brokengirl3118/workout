'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Dumbbell, ShieldCheck, X } from 'lucide-react';
import { supabase, Exercise } from '@/lib/supabase';
import { AGE_GROUPS, LevelKey } from '@/lib/data';
import LevelGuideModal from '@/components/LevelGuideModal';
import BloomCoach from '@/components/BloomCoach';

export default function HomePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('18-39');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [guideLevel, setGuideLevel] = useState<LevelKey | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      const { data } = await supabase.from('exercises').select('*').order('name');
      if (data) setExercises(data as Exercise[]);
      setLoading(false);
    };
    fetchExercises();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      // Global Search overrides age filter so users find any exercise from any age
      if (q) {
        const matchText =
          ex.name.toLowerCase().includes(q) ||
          ex.muscle_group.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q) ||
          ex.category.toLowerCase().includes(q);
        if (!matchText) return false;
      } else {
        // Age filter: 18-39 gets ALL exercises (except infant-only 0-2)
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

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero + Global Search */}
      <header className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Dumbbell className="h-7 w-7 text-emerald-400" />
              <h1 className="text-2xl font-extrabold tracking-tight">
                FitLife <span className="text-emerald-400">0–90</span>
              </h1>
            </div>

            {/* Trusted Level Guides */}
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
            Complete workout guide for infants, kids, teens, men, women, and seniors (0–90 years).
          </p>

          {/* Global Search Bar */}
          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search any exercise across ALL ages (e.g., Bench Press, Chair, Squat, Tummy Time)..."
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </header>

      {/* Age Tabs & Gender Filter */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setSearch('');
                  setSelectedAge(g.id);
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

        {/* Exercise Grid */}
        {loading ? (
          <p className="mt-12 text-center text-sm text-zinc-400">Loading exercises from Supabase...</p>
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-zinc-400">No exercises found. Try another search or age group.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ex) => (
              <div
                key={ex.id}
                onClick={() => setActiveExercise(ex)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 transition hover:border-emerald-500/60"
              >
                {ex.media_url && (
                  <img
                    src={ex.media_url}
                    alt={ex.name}
                    className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                )}
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
        )}
      </section>

      {/* Exercise Details Modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <button
              onClick={() => setActiveExercise(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white">{activeExercise.name}</h2>
            <p className="mt-1 text-xs text-emerald-400">
              {activeExercise.muscle_group} • {activeExercise.equipment} • {activeExercise.sets_reps}
            </p>
            {activeExercise.media_url && (
              <img
                src={activeExercise.media_url}
                alt={activeExercise.name}
                className="mt-4 h-52 w-full rounded-xl object-cover"
              />
            )}
            <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
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

      {/* Level Guide + Readiness Check Modal */}
      <LevelGuideModal selectedLevel={guideLevel} onClose={() => setGuideLevel(null)} />

      {/* 🌸 AI Coach */}
      <BloomCoach />
    </main>
  );
}