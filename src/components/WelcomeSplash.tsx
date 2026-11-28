'use client';

import { useEffect, useState } from 'react';
import { Heart, ArrowRight } from 'lucide-react';

export default function WelcomeSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 550);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      className={`fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-[#060609]/95 p-5 backdrop-blur-xl transition-all duration-500 ${
        fading ? 'pointer-events-none scale-105 opacity-0' : 'scale-100 opacity-100'
      }`}
    >
      <div className="matte-box relative w-full max-w-sm rounded-3xl px-8 py-10 text-center shadow-2xl shadow-sky-500/10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-pink-500/20 text-3xl">
          🌸
        </div>

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
            Welcome
          </span>
        </h1>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-300">
          Your fitness &amp; health space <Heart className="h-3.5 w-3.5 fill-pink-400 text-pink-400" />
        </p>

        <button
          type="button"
          onClick={dismiss}
          className="matte-pill mt-6 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold text-sky-300 transition hover:scale-105 hover:text-white"
        >
          Enter <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}