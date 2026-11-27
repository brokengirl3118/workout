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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-sky-100 bg-white p-6 text-slate-800 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl bg-sky-50 p-2 text-slate-500 hover:bg-sky-100 hover:text-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {!guide && !recommendation && selectedLevel !== 'Beginner' && (
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
              <Award className="h-4 w-4" /> {selectedLevel} Readiness Check
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Quick Exercise Check</h2>
            <p className="mt-1 text-sm text-slate-500">
              Answer honestly so we can match you to the safest, most effective guide.
            </p>

            <div className="mt-5 space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-4 sm:flex-row sm:items-center"
                >
                  <p className="text-sm font-medium text-slate-700">{q}</p>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setAnswers((p) => ({ ...p, [idx]: true }))}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                        answers[idx] === true
                          ? 'bg-sky-500 text-white'
                          : 'bg-white text-slate-600 border border-sky-200 hover:bg-sky-100'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setAnswers((p) => ({ ...p, [idx]: false }))}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                        answers[idx] === false
                          ? 'bg-rose-500 text-white'
                          : 'bg-white text-slate-600 border border-sky-200 hover:bg-sky-100'
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
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check My Level
            </button>
          </div>
        )}

        {!guide && recommendation && (
          <div className="py-4 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
            <h2 className="mt-3 text-xl font-extrabold text-slate-900">
              We Recommend Starting with {recommendation}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Building a stronger base first prevents joint injuries and gives faster results.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => setActiveGuide(recommendation)}
                className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-200"
              >
                Open {recommendation} Guide
              </button>
              <button
                onClick={() => setActiveGuide(selectedLevel)}
                className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-100"
              >
                Continue to {selectedLevel} Anyway
              </button>
            </div>
          </div>
        )}

        {guide && (
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
              <CheckCircle2 className="h-4 w-4" /> Verified Guide
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">{guide.title}</h2>
            <p className="mt-1 text-sm font-semibold text-sky-600">{guide.split}</p>

            <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Core Rules
            </h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {guide.rules.map((r, i) => (
                <li key={i} className="rounded-xl bg-sky-50 px-3.5 py-2.5">
                  • {r}
                </li>
              ))}
            </ul>

            <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Weekly Structure
            </h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {guide.weeklyPlan.map((d, i) => (
                <li key={i} className="rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 shadow-sm">
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