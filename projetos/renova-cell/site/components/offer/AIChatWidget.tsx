'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/hooks';
import { useOffer } from './context';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

/** Streaming chat with "Elena", clearly labelled as an AI assistant (not a doctor). */
export function AIChatWidget() {
  const { d, locale } = useT();
  const { persona, recommended } = useOffer();
  const c = d.offer.chat;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  // Below lg the launcher would sit on top of the hero headline: it appears once the visitor scrolls.
  const [scrolled, setScrolled] = useState(false);
  // Below xl it would sit on a plan button: it steps aside while the pricing cards are on screen.
  const [pricingInView, setPricingInView] = useState(false);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [messages, open]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.4) {
        setScrolled(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const pricing = document.getElementById('pricing');
    if (!pricing) return;
    const io = new IntersectionObserver(([entry]) => setPricingInView(Boolean(entry?.isIntersecting)));
    io.observe(pricing);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim().slice(0, 1000);
    if (!text || busy) return;
    const history: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, locale, persona, plan: recommended }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: 'assistant', content: reply }]);
      }
      if (!reply) throw new Error('empty');
    } catch {
      // Drop the failed turn so the next request still alternates user/assistant.
      setMessages([...messages, { role: 'user', content: text }, { role: 'assistant', content: c.error }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? c.close : c.open}
        className={`float-chat-button z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-brand text-2xl text-cream shadow-xl ${
          open ? '' : `${scrolled ? '' : 'max-lg:hidden'} ${pricingInView ? 'max-xl:hidden' : ''}`
        }`}
      >
        {open ? '×' : '💬'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={c.title}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="float-chat-panel z-40 flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] shadow-2xl"
          >
            <header className="bg-emerald-brand px-4 py-3 text-cream">
              <p className="font-semibold">{c.title}</p>
              <p className="text-xs text-cream/80">{c.subtitle}</p>
            </header>
            <div ref={list} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 text-sm [overflow-wrap:anywhere]" aria-live="polite">
              <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-emerald-brand/10 px-3 py-2">{c.greeting}</p>
              {messages.map((m, i) => (
                <p
                  key={i}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${
                    m.role === 'user' ? 'ml-auto rounded-tr-sm bg-gold text-ink' : 'rounded-tl-sm bg-emerald-brand/10'
                  }`}
                >
                  {m.content || '…'}
                </p>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-[var(--line)] p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={c.placeholder}
                aria-label={c.placeholder}
                maxLength={1000}
                className="min-h-[44px] min-w-0 flex-1 rounded-full border border-[var(--line)] bg-transparent px-4 text-base"
              />
              <button disabled={busy || !input.trim()} className="min-h-[44px] shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-ink disabled:opacity-50">
                {c.send}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
