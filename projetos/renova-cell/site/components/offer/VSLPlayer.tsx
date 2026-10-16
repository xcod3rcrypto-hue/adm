'use client';

import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/hooks';
import { GlowButton } from '../ui/GlowButton';
import { scrollToPricing, useOffer } from './context';

const CTA_AT_S = 90;
/** Set NEXT_PUBLIC_VSL_LOCK_SEEK=false to let viewers skip ahead freely. */
const LOCK_SEEK = process.env.NEXT_PUBLIC_VSL_LOCK_SEEK !== 'false';
const UNLOCK_AT = 0.7;

/**
 * Persona VSL (HeyGen, re-hosted). Resumes from the last position, shows the CTA at 1:30,
 * and — optionally — stops forward seeking until 70% has been watched. Backward seeking is
 * always allowed and native controls (pause, volume, captions, fullscreen) stay available.
 */
export function VSLPlayer() {
  const { d, locale } = useT();
  const { persona } = useOffer();
  const [src, setSrc] = useState<string | null | undefined>(undefined);
  const [showCta, setShowCta] = useState(false);
  const [resumed, setResumed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const furthest = useRef(0);
  const storageKey = `rc_vsl_${persona}_${locale}`;

  useEffect(() => {
    let alive = true;
    fetch(`/api/heygen?persona=${persona}&locale=${locale}`)
      .then((r) => r.json())
      .then((data: { url?: string | null }) => alive && setSrc(data.url ?? null))
      .catch(() => alive && setSrc(null));
    return () => {
      alive = false;
    };
  }, [persona, locale]);

  const onLoaded = () => {
    const v = video.current;
    if (!v) return;
    try {
      const saved = Number(localStorage.getItem(storageKey) ?? 0);
      if (saved > 5 && saved < v.duration - 5) {
        v.currentTime = saved;
        furthest.current = saved;
        setResumed(true);
      }
    } catch {
      // storage unavailable
    }
  };

  const onTime = () => {
    const v = video.current;
    if (!v) return;
    furthest.current = Math.max(furthest.current, v.currentTime);
    if (v.currentTime >= CTA_AT_S) setShowCta(true);
    try {
      localStorage.setItem(storageKey, String(Math.floor(v.currentTime)));
    } catch {
      // ignore
    }
  };

  const onSeeking = () => {
    const v = video.current;
    if (!v || !LOCK_SEEK || !v.duration) return;
    const unlocked = furthest.current / v.duration >= UNLOCK_AT;
    if (!unlocked && v.currentTime > furthest.current + 1) v.currentTime = furthest.current;
  };

  return (
    <section className="section text-center">
      <h2 className="h2 mb-8">{d.offer.vsl.title}</h2>
      {src === undefined && <div className="card mx-auto aspect-video max-w-3xl animate-pulse" />}
      {src === null && <p className="muted mx-auto max-w-xl">{d.offer.vsl.unavailable}</p>}
      {src && (
        <div className="mx-auto max-w-3xl">
          <video
            ref={video}
            src={src}
            controls
            playsInline
            preload="metadata"
            onLoadedMetadata={onLoaded}
            onTimeUpdate={onTime}
            onSeeking={onSeeking}
            className="aspect-video w-full rounded-2xl bg-ink shadow-2xl"
          />
          {resumed && <p className="muted mt-2 text-sm">⏯ {d.offer.vsl.resume}</p>}
        </div>
      )}
      {(showCta || src === null) && (
        <GlowButton className="mt-8" onClick={scrollToPricing}>
          {d.offer.vsl.cta} →
        </GlowButton>
      )}
    </section>
  );
}
