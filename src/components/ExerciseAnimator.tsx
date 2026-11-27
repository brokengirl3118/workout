'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, Gauge, RotateCcw, Youtube } from 'lucide-react';

interface Props {
  name: string;
  frame1: string | null;
  frame2?: string | null;
}

export default function ExerciseAnimator({ name, frame1, frame2 }: Props) {
  const [playing, setPlaying] = useState(true);
  const [frame, setFrame] = useState<0 | 1>(0);
  const [speedMs, setSpeedMs] = useState<number>(900);
  const [reps, setReps] = useState<number>(0);

  const hasTwoFrames = Boolean(frame1 && frame2 && frame1 !== frame2);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setFrame((prev) => {
        if (prev === 1) {
          setReps((r) => r + 1);
          return 0;
        }
        return 1;
      });
    }, speedMs);
    return () => clearInterval(timer);
  }, [playing, speedMs]);

  const videoSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `how to do ${name} proper form`
  )}`;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {/* Smooth Dual-Layer Crossfade Animation */}
      <div className="relative h-64 w-full overflow-hidden bg-black">
        {frame1 ? (
          <>
            <img
              src={frame1}
              alt={`${name} start position`}
              className={`absolute inset-0 h-full w-full object-contain transition-all duration-500 ${
                frame === 0
                  ? 'opacity-100 scale-100'
                  : hasTwoFrames
                  ? 'opacity-0 scale-105'
                  : 'opacity-100 scale-105'
              }`}
            />
            {hasTwoFrames && frame2 && (
              <img
                src={frame2}
                alt={`${name} peak position`}
                className={`absolute inset-0 h-full w-full object-contain transition-all duration-500 ${
                  frame === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            No animation preview available
          </div>
        )}

        {/* Live Phase & Breathing Cue */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur">
          <span
            className={`h-2 w-2 rounded-full ${
              playing ? 'animate-pulse bg-emerald-400' : 'bg-zinc-500'
            }`}
          />
          {playing
            ? frame === 0
              ? 'INHALE • START POSE'
              : 'EXHALE • PEAK MOTION'
            : 'PAUSED'}
        </div>

        {/* Live Rep Counter */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
          Reps: <span className="text-emerald-400">{reps}</span>
          <button
            onClick={() => setReps(0)}
            title="Reset Reps"
            className="ml-1 text-zinc-400 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>

        {/* Motion Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-zinc-800">
          <div
            className={`h-full bg-emerald-400 transition-all duration-500 ${
              frame === 1 ? 'w-full' : 'w-1/3'
            }`}
          />
        </div>
      </div>

      {/* Animation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 px-3 py-2 text-xs">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 font-bold text-emerald-400 hover:bg-emerald-500/25"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </button>

        <div className="flex items-center gap-1 text-zinc-400">
          <Gauge className="h-3.5 w-3.5" />
          {[
            { label: 'Slow', ms: 1300 },
            { label: 'Normal', ms: 900 },
            { label: 'Fast', ms: 500 },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setSpeedMs(s.ms)}
              className={`rounded-md px-2 py-1 font-semibold ${
                speedMs === s.ms ? 'bg-zinc-700 text-white' : 'hover:bg-zinc-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <a
          href={videoSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-lg bg-rose-500/15 px-2.5 py-1.5 font-bold text-rose-400 hover:bg-rose-500/25"
        >
          <Youtube className="h-3.5 w-3.5" /> Live Video
        </a>
      </div>
    </div>
  );
}