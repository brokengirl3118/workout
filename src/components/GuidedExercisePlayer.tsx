'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  CheckCircle2,
  SkipForward,
  RotateCcw,
  ArrowLeft,
  Award,
  Timer,
  Flame,
} from 'lucide-react';
import { Exercise } from '@/lib/supabase';
import ExerciseAnimator from './ExerciseAnimator';

interface Props {
  exercise: Exercise;
  onExit: () => void;
}

function parseSetsReps(setsReps: string) {
  const setsMatch = setsReps.match(/(\d+)\s*set/i);
  const totalSets = setsMatch ? Math.min(6, Math.max(1, Number(setsMatch[1]))) : 3;

  const isTimed = /sec|min/i.test(setsReps);
  const numMatch = setsReps.match(/x\s*(\d+)/i) || setsReps.match(/(\d+)\s*(rep|sec)/i);
  const targetVal = numMatch ? Number(numMatch[1]) : isTimed ? 30 : 12;

  return { totalSets, isTimed, targetVal };
}

export default function GuidedExercisePlayer({ exercise, onExit }: Props) {
  const plan = useMemo(() => parseSetsReps(exercise.sets_reps || ''), [exercise.sets_reps]);

  const [currentSet, setCurrentSet] = useState(1);
  const [repsDone, setRepsDone] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(plan.isTimed ? plan.targetVal : 0);
  const [isRunning, setIsRunning] = useState(true);
  const [phase, setPhase] = useState<'work' | 'rest' | 'done'>('work');
  const [restSeconds, setRestSeconds] = useState(45);
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  // Cycle form cue steps while working
  useEffect(() => {
    if (phase !== 'work' || !isRunning || exercise.instructions.length <= 1) return;
    const t = setInterval(() => {
      setActiveStepIdx((i) => (i + 1) % exercise.instructions.length);
    }, 3500);
    return () => clearInterval(t);
  }, [phase, isRunning, exercise.instructions.length]);

  // Auto-count timer for timed exercises OR rest countdown
  useEffect(() => {
    if (!isRunning) return;

    if (phase === 'work' && plan.isTimed) {
      const t = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(t);
            handleFinishSet();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }

    if (phase === 'rest') {
      const t = setInterval(() => {
        setRestSeconds((s) => {
          if (s <= 1) {
            clearInterval(t);
            startNextSet();
            return 45;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [phase, isRunning, plan.isTimed, currentSet]);

  const handleFinishSet = () => {
    if (currentSet >= plan.totalSets) {
      setPhase('done');
    } else {
      setPhase('rest');
      setRestSeconds(45);
    }
  };

  const startNextSet = () => {
    setCurrentSet((s) => s + 1);
    setRepsDone(0);
    setSecondsLeft(plan.isTimed ? plan.targetVal : 0);
    setPhase('work');
    setIsRunning(true);
  };

  const restartAll = () => {
    setCurrentSet(1);
    setRepsDone(0);
    setSecondsLeft(plan.isTimed ? plan.targetVal : 0);
    setRestSeconds(45);
    setPhase('work');
    setIsRunning(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-extrabold text-sky-800 hover:bg-sky-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Details
        </button>
        <span className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-3.5 py-1 text-xs font-black text-white">
          LIVE GUIDED MODE
        </span>
      </div>

      {/* DONE SCREEN */}
      {phase === 'done' ? (
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-sky-50 p-7 text-center">
          <Award className="mx-auto h-14 w-14 text-emerald-500" />
          <h3 className="mt-3 text-2xl font-black text-slate-900">Exercise Complete!</h3>
          <p className="mt-2 text-sm font-medium text-slate-600">
            You finished all <strong>{plan.totalSets} sets</strong> of <strong>{exercise.name}</strong>. Drink a few sips of water and stretch your {exercise.muscle_group.toLowerCase()}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={restartAll}
              className="flex items-center gap-1.5 rounded-2xl border border-sky-200 bg-white px-5 py-2.5 text-xs font-extrabold text-sky-800 hover:bg-sky-50"
            >
              <RotateCcw className="h-4 w-4" /> Do Again
            </button>
            <button
              onClick={onExit}
              className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 text-xs font-extrabold text-white shadow-[4px_4px_0px_0px_#bae6fd]"
            >
              Done &amp; Return
            </button>
          </div>
        </div>
      ) : phase === 'rest' ? (
        /* REST TIMER SCREEN */
        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-sky-50 p-7 text-center">
          <Timer className="mx-auto h-10 w-10 text-indigo-500" />
          <p className="mt-2 text-xs font-black uppercase tracking-widest text-indigo-600">
            Rest &amp; Breathe
          </p>
          <p className="mt-2 text-5xl font-black text-slate-900">{restSeconds}s</p>
          <p className="mt-2 text-xs font-semibold text-slate-600">
            Next up: <strong>Set {currentSet + 1} of {plan.totalSets}</strong> ({exercise.sets_reps})
          </p>
          <button
            onClick={startNextSet}
            className="mt-6 inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-xs font-extrabold text-white shadow-[4px_4px_0px_0px_#bae6fd]"
          >
            <SkipForward className="h-4 w-4" /> Skip Rest &amp; Start Set {currentSet + 1}
          </button>
        </div>
      ) : (
        /* ACTIVE WORK SCREEN */
        <>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
              <p className="text-[10px] font-black uppercase text-sky-700">Current Set</p>
              <p className="mt-0.5 text-lg font-black text-slate-900">
                {currentSet} / {plan.totalSets}
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
              <p className="text-[10px] font-black uppercase text-indigo-700">
                {plan.isTimed ? 'Time Left' : 'Target Reps'}
              </p>
              <p className="mt-0.5 text-lg font-black text-indigo-700">
                {plan.isTimed ? `${secondsLeft}s` : `${repsDone} / ${plan.targetVal}`}
              </p>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-pink-50/70 p-3">
              <p className="text-[10px] font-black uppercase text-rose-700">Target</p>
              <p className="mt-0.5 truncate text-xs font-black text-rose-700">
                {exercise.muscle_group}
              </p>
            </div>
          </div>

          <ExerciseAnimator
            name={exercise.name}
            frame1={exercise.media_url}
            frame2={exercise.media_url_2}
          />

          {/* Live Highlighted Coaching Cues */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-sky-700">
              <Flame className="h-3.5 w-3.5 text-orange-500" /> Live Form Guide
            </p>
            <div className="mt-2.5 space-y-2">
              {exercise.instructions.map((step, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    idx === activeStepIdx
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-white/80 text-slate-600'
                  }`}
                >
                  {idx + 1}. {step}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {plan.isTimed ? (
              <button
                onClick={() => setIsRunning((r) => !r)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-sky-200 bg-sky-50 py-3 text-xs font-extrabold text-sky-800 hover:bg-sky-100"
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? 'Pause Timer' : 'Resume Timer'}
              </button>
            ) : (
              <button
                onClick={() => {
                  const next = repsDone + 1;
                  setRepsDone(next);
                  if (next >= plan.targetVal) handleFinishSet();
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-indigo-200 bg-indigo-50 py-3 text-xs font-extrabold text-indigo-800 hover:bg-indigo-100"
              >
                +1 Rep Done ({repsDone}/{plan.targetVal})
              </button>
            )}

            <button
              onClick={handleFinishSet}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 py-3 text-xs font-extrabold text-white shadow-[4px_4px_0px_0px_#bae6fd] hover:brightness-105"
            >
              <CheckCircle2 className="h-4 w-4" />
              {currentSet >= plan.totalSets ? 'Finish Exercise' : `Complete Set ${currentSet}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}