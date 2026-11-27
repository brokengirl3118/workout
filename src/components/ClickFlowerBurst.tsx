'use client';

import { useEffect, useRef } from 'react';

interface FlowerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  alpha: number;
  life: number;
  emoji: string;
}

const FLOWERS = ['🌸', '🌺', '🌷', '🌸', '🌼', '🪷'];

export default function ClickFlowerBurst() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<FlowerParticle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const gravity = 0.34;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const list = particlesRef.current;

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life += 1;
        p.vy += gravity;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (p.life > 32) p.alpha -= 0.03;

        if (p.alpha <= 0 || p.y > canvas.height + 30) {
          list.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      if (list.length > 0) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        rafRef.current = null;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 7,
          vy: -Math.random() * 5 - 2,
          size: 16 + Math.random() * 8,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.14,
          alpha: 1,
          life: 0,
          emoji: FLOWERS[Math.floor(Math.random() * FLOWERS.length)],
        });
      }
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[999]" />;
}