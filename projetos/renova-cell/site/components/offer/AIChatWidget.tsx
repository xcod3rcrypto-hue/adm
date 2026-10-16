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
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [messages, open]);

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
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-brand text-2xl text-cream shadow-xl sm:bottom-6"
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
            className="fixed bottom-36 right-4 z-40 flex h-[min(520px,70dvh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] shadow-2xl sm:bottom-24"
          >
            <header className="bg-emerald-brand px-4 py-3 text-cream">
              <p className="font-semibold">{c.title}</p>
              <p className="text-xs text-cream/80">{c.subtitle}</p>
            </header>
            <div ref={list} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
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
                className="min-h-[44px] flex-1 rounded-full border border-[var(--line)] bg-transparent px-4 text-sm"
              />
              <button disabled={busy || !input.trim()} className="rounded-full bg-gold px-4 text-sm font-semibold text-ink disabled:opacity-50">
                {c.send}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
