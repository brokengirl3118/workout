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

const FLOWERS = ['🌸', '🌺', '🌷', '🌹', '🌼', '🪷', '💮'];

export default function ClickFlowerBurst() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<FlowerParticle[]>([]);

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

    const spawnBunch = (x: number, y: number) => {
      const count = 10;
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 7.5;
        const upwardPop = -Math.random() * 5.2 - 2.2;
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 14,
          vx: spread,
          vy: upwardPop,
          size: 16 + Math.random() * 10,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.14,
          alpha: 1,
          life: 0,
          emoji: FLOWERS[Math.floor(Math.random() * FLOWERS.length)],
        });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      spawnBunch(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown);

    let animId: number;
    const gravity = 0.32;

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

        if (p.life > 38) {
          p.alpha -= 0.025;
        }

        if (p.alpha <= 0 || p.y > canvas.height + 40) {
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

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[999]"
    />
  );
}