'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, Gauge, RotateCcw, Video } from 'lucide-react';

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
    <div className="matte-box-soft mt-3 overflow-hidden rounded-2xl">
      <div className="relative h-56 w-full overflow-hidden bg-black">
        {frame1 ? (
          <>
            <img
              src={frame1}
              alt={`${name} start`}
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
                alt={`${name} peak`}
                className={`absolute inset-0 h-full w-full object-contain transition-all duration-500 ${
                  frame === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No preview
          </div>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-[10px] font-bold text-sky-300 backdrop-blur">
          <span className={`h-1.5 w-1.5 rounded-full ${playing ? 'animate-pulse bg-sky-400' : 'bg-slate-500'}`} />
          {playing ? (frame === 0 ? 'INHALE' : 'EXHALE') : 'PAUSED'}
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-[10px] font-bold text-white backdrop-blur">
          Reps: <span className="text-pink-400">{reps}</span>
          <button onClick={() => setReps(0)} className="ml-1 text-slate-400 hover:text-white">
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 h-1 w-full bg-white/10">
          <div className={`h-full bg-gradient-to-r from-sky-400 to-pink-400 transition-all duration-500 ${frame === 1 ? 'w-full' : 'w-1/3'}`} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#0d0d13] px-3 py-2 text-xs">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex items-center gap-1 rounded-lg bg-sky-500/20 px-2.5 py-1 font-bold text-sky-300 hover:bg-sky-500/30"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? 'Pause' : 'Play'}
        </button>

        <div className="flex items-center gap-1 text-slate-400">
          <Gauge className="h-3 w-3 text-sky-400" />
          {[
            { label: 'Slow', ms: 1300 },
            { label: 'Normal', ms: 900 },
            { label: 'Fast', ms: 500 },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setSpeedMs(s.ms)}
              className={`rounded-md px-2 py-0.5 font-bold ${
                speedMs === s.ms ? 'bg-white/15 text-white' : 'hover:bg-white/5'
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
          className="flex items-center gap-1 rounded-lg bg-pink-500/20 px-2.5 py-1 font-bold text-pink-300 hover:bg-pink-500/30"
        >
          <Video className="h-3 w-3" /> Video
        </a>
      </div>
    </div>
  );
}