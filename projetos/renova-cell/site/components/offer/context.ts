'use client';

import { createContext, useContext } from 'react';
import type { PlanId, Persona, QuizAnswers } from '@/lib/quiz';

export interface OfferContextValue {
  answers: QuizAnswers;
  persona: Persona;
  recommended: PlanId;
  name: string;
  headline: string | null;
  choosePlan: (plan: PlanId) => void;
}

export const OfferContext = createContext<OfferContextValue | null>(null);

export function useOffer(): OfferContextValue {
  const value = useContext(OfferContext);
  if (!value) throw new Error('useOffer must be used inside <OfferContext.Provider>');
  return value;
}

export const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
