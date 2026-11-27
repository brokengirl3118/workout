'use client';

import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Award } from 'lucide-react';
import { LevelKey, READINESS_QUESTIONS, TRUSTED_GUIDES } from '@/lib/data';

interface Props {
  selectedLevel: LevelKey | null;
  onClose: () => void;
}

export default function LevelGuideModal({ selectedLevel, onClose }: Props) {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [activeGuide, setActiveGuide] = useState<LevelKey | null>(
    selectedLevel === 'Beginner' ? 'Beginner' : null
  );
  const [recommendation, setRecommendation] = useState<LevelKey | null>(null);

  if (!selectedLevel) return null;

  const questions =
    selectedLevel !== 'Beginner' ? READINESS_QUESTIONS[selectedLevel] : [];

  const handleVerify = () => {
    const yesCount = Object.values(answers).filter(Boolean).length;
    if (yesCount >= 3) {
      setActiveGuide(selectedLevel);
    } else {
      setRecommendation(selectedLevel === 'Advanced' ? 'Intermediate' : 'Beginner');
    }
  };

  const guide = activeGuide ? TRUSTED_GUIDES[activeGuide] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step 1: Readiness Check for Intermediate / Advanced */}
        {!guide && !recommendation && selectedLevel !== 'Beginner' && (
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Award className="h-4 w-4" /> {selectedLevel} Readiness Check
            </div>
            <h2 className="text-xl font-bold">Quick Exercise Check</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Answer honestly so we can match you to the safest, most effective guide.
            </p>

            <div className="mt-5 space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:flex-row sm:items-center"
                >
                  <p className="text-sm text-zinc-200">{q}</p>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setAnswers((p) => ({ ...p, [idx]: true }))}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        answers[idx] === true
                          ? 'bg-emerald-500 text-black'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setAnswers((p) => ({ ...p, [idx]: false }))}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        answers[idx] === false
                          ? 'bg-rose-500 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={Object.keys(answers).length < questions.length}
              className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check My Level
            </button>
          </div>
        )}

        {/* Step 2: Safety Recommendation if score < 3 */}
        {!guide && recommendation && (
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
            <h2 className="mt-3 text-xl font-bold">
              We Recommend Starting with {recommendation}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Building a stronger base first prevents joint injuries and gives faster results.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => setActiveGuide(recommendation)}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-emerald-400"
              >
                Open {recommendation} Guide
              </button>
              <button
                onClick={() => setActiveGuide(selectedLevel)}
                className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Continue to {selectedLevel} Anyway
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Full Trusted Guide */}
        {guide && (
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Verified Guide
            </span>
            <h2 className="mt-2 text-2xl font-bold">{guide.title}</h2>
            <p className="mt-1 text-sm font-medium text-emerald-400">{guide.split}</p>

            <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-zinc-400">
              Core Rules
            </h3>
            <ul className="mt-2 space-y-2 text-sm text-zinc-200">
              {guide.rules.map((r, i) => (
                <li key={i} className="rounded-lg bg-zinc-900 px-3 py-2">
                  • {r}
                </li>
              ))}
            </ul>

            <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-zinc-400">
              Weekly Structure
            </h3>
            <ul className="mt-2 space-y-2 text-sm text-zinc-200">
              {guide.weeklyPlan.map((d, i) => (
                <li key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}