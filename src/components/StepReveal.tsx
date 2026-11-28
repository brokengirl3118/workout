'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface StepRevealProps {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}

export default function StepReveal({
  children,
  delayMs = 0,
  className = '',
}: StepRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`transition-all duration-500 ease-out will-change-transform ${
        shown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-[0.985] opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}