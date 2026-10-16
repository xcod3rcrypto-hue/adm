'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LOCALE, type Locale } from './i18n';
import type { PlanId, QuizAnswers } from './quiz';

export interface Contact {
  name: string;
  email: string;
  phone: string;
  marketingConsent: boolean;
  smsConsent: boolean;
}

interface FunnelState {
  locale: Locale;
  /** true once the visitor picked a language themselves — never auto-override after that. */
  localeChosen: boolean;
  step: number;
  answers: Partial<QuizAnswers>;
  contact: Contact;
  quizId: string | null;
  headline: string | null;
  plan: PlanId | null;
  bump: boolean;
  coupon: string | null;
  setLocale: (locale: Locale, chosen?: boolean) => void;
  setStep: (step: number) => void;
  answer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  setContact: (contact: Partial<Contact>) => void;
  setResult: (quizId: string | null, headline: string | null) => void;
  setPlan: (plan: PlanId) => void;
  setBump: (bump: boolean) => void;
  setCoupon: (coupon: string | null) => void;
  reset: () => void;
}

const emptyContact: Contact = { name: '', email: '', phone: '', marketingConsent: false, smsConsent: false };

export const useFunnel = create<FunnelState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      localeChosen: false,
      step: 0,
      answers: {},
      contact: emptyContact,
      quizId: null,
      headline: null,
      plan: null,
      bump: false,
      coupon: null,
      setLocale: (locale, chosen = false) => set((s) => ({ locale, localeChosen: s.localeChosen || chosen })),
      setStep: (step) => set({ step }),
      answer: (key, value) => set((s) => ({ answers: { ...s.answers, [key]: value } })),
      setContact: (contact) => set((s) => ({ contact: { ...s.contact, ...contact } })),
      setResult: (quizId, headline) => set({ quizId, headline }),
      setPlan: (plan) => set({ plan }),
      setBump: (bump) => set({ bump }),
      setCoupon: (coupon) => set({ coupon }),
      reset: () =>
        set({ step: 0, answers: {}, quizId: null, headline: null, plan: null, bump: false, coupon: null }),
    }),
    {
      name: 'renova-funnel',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
