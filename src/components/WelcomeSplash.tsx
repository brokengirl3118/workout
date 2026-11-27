'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';

export default function WelcomeSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 600);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss();
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      className={`fixed inset-0 z-[100] flex cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-indigo-50 to-pink-100 p-6 transition-all duration-700 ${
        fading ? 'pointer-events-none scale-105 opacity-0' : 'scale-100 opacity-100'
      }`}
    >
      {/* Soft Blurred Ambient Orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-sky-300/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-96 w-96 animate-pulse rounded-full bg-pink-300/45 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/40 blur-3xl" />

      {/* Smooth Glass Welcome Card */}
      <div className="relative max-w-md rounded-[2.5rem] border border-white/90 bg-white/80 px-10 py-12 text-center shadow-[0_24px_60px_-12px_rgba(56,189,248,0.35)] backdrop-blur-2xl transition-transform duration-500">
        <div className="mx-auto flex h-16 w-16 animate-bounce items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 via-indigo-400 to-pink-400 text-white shadow-lg shadow-sky-200/80">
          <Sparkles className="h-8 w-8" />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-sky-600">
          FitLife 0–90 Wellness Studio
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
          Welcome{' '}
          <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
            Harsh
          </span>
          <span className="inline-flex text-pink-400">
            <span className="animate-pulse">.</span>
            <span className="animate-pulse [animation-delay:150ms]">.</span>
            <span className="animate-pulse [animation-delay:300ms]">.</span>
            <span className="animate-pulse [animation-delay:450ms]">.</span>
            <span className="animate-pulse [animation-delay:600ms]">.</span>
          </span>
        </h1>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500">
          Preparing your calm, healthy space <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
        </p>

        <button
          onClick={dismiss}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-200/80 transition hover:scale-105"
        >
          Enter Studio <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}