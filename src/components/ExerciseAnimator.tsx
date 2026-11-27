'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, Gauge } from 'lucide-react';

interface Props {
  name: string;
  frame1: string | null;
  frame2?: string | null;
}

export default function ExerciseAnimator({ name, frame1, frame2 }: Props) {
  const [playing, setPlaying] = useState(true);
  const [frame, setFrame] = useState<0 | 1>(0);
  const [speedMs, setSpeedMs] = useState<number>(800);

  const hasTwoFrames = Boolean(frame1 && frame2 && frame1 !== frame2);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, speedMs);
    return () => clearInterval(timer);
  }, [playing, speedMs]);

  const activeSrc = frame === 1 && hasTwoFrames ? frame2! : frame1;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="relative h-60 w-full overflow-hidden bg-black">
        {activeSrc ? (
          <img
            src={activeSrc}
            alt={`${name} animation`}
            className={`h-full w-full object-contain transition-transform duration-500 ${
              !hasTwoFrames && playing && frame === 1 ? 'scale-105' : 'scale-100'
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            No animation preview available
          </div>
        )}

        {/* Live Phase Badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur">
          <span
            className={`h-2 w-2 rounded-full ${
              playing ? 'animate-pulse bg-emerald-400' : 'bg-zinc-500'
            }`}
          />
          {playing ? (frame === 0 ? 'START POSE' : 'PEAK MOTION') : 'PAUSED'}
        </div>
      </div>

      {/* Animation Controls */}
      <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2 text-xs">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 font-bold text-emerald-400 hover:bg-emerald-500/25"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </button>

        <div className="flex items-center gap-1.5 text-zinc-400">
          <Gauge className="h-3.5 w-3.5" />
          {[
            { label: 'Slow', ms: 1200 },
            { label: 'Normal', ms: 800 },
            { label: 'Fast', ms: 450 },
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
      </div>
    </div>
  );
}