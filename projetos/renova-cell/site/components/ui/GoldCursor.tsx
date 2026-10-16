'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks';

const TRAIL = 8;

/** Custom gold cursor with a short trail. Only on mouse devices, never with reduced motion. */
export function GoldCursor() {
  const reduced = usePrefersReducedMotion();
  const dots = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    document.documentElement.classList.add('has-gold-cursor');
    const points = Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 }));
    const mouse = { x: -100, y: -100 };
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const loop = () => {
      points.forEach((p, i) => {
        const target = i === 0 ? mouse : points[i - 1]!;
        p.x += (target.x - p.x) * (i === 0 ? 1 : 0.45);
        p.y += (target.y - p.y) * (i === 0 ? 1 : 0.45);
        const el = dots.current[i];
        if (el) el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
      });
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove);
    frame = requestAnimationFrame(loop);
    return () => {
      document.documentElement.classList.remove('has-gold-cursor');
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      {Array.from({ length: TRAIL }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            dots.current[i] = el;
          }}
          className="fixed left-0 top-0 rounded-full bg-gold"
          style={{
            width: i === 0 ? 12 : Math.max(3, 9 - i),
            height: i === 0 ? 12 : Math.max(3, 9 - i),
            opacity: i === 0 ? 1 : 0.5 - i * 0.05,
            boxShadow: i === 0 ? '0 0 12px rgba(212,175,55,0.8)' : undefined,
          }}
        />
      ))}
    </div>
  );
}
