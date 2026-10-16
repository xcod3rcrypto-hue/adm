'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { track } from '@/lib/analytics';
import { useHydrated } from '@/lib/hooks';
import { isLocale } from '@/lib/i18n';
import { parseAnswers, personaOf, recommendedPlan, type PlanId, type QuizAnswers } from '@/lib/quiz';
import { useFunnel } from '@/lib/store';
import { Footer } from '../ui/Footer';
import { GoldCursor } from '../ui/GoldCursor';
import { ScrollProgress } from '../ui/ScrollProgress';
import { AIChatWidget } from './AIChatWidget';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { BonusStack } from './BonusStack';
import { ComparisonTable } from './ComparisonTable';
import { OfferContext, type OfferContextValue } from './context';
import { DiagnosisCard } from './DiagnosisCard';
import { DynamicHero } from './DynamicHero';
import { ExitIntent } from './ExitIntent';
import { GuaranteeSeal } from './GuaranteeSeal';
import { LiveSocialProof } from './LiveSocialProof';
import { PersonalBullets } from './PersonalBullets';
import { PricingCards } from './PricingCards';
import { ResultSimulator } from './ResultSimulator';
import { ScienceCards } from './ScienceCards';
import { SmartFAQ } from './SmartFAQ';
import { StickyCTA } from './StickyCTA';
import { Testimonials } from './Testimonials';
import { TimelineScroll } from './TimelineScroll';
import { TrustBar } from './TrustBar';
import { VSLPlayer } from './VSLPlayer';

export function OfferPage() {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const { answers, contact, headline, setPlan, setResult, answer, setLocale, localeChosen } = useFunnel();
  const [restoring, setRestoring] = useState(false);
  const parsed = useMemo(() => parseAnswers(answers), [answers]);

  // Someone coming back from an email link on another device: restore their answers.
  useEffect(() => {
    if (!hydrated || parsed) return;
    const lead = params.get('lead');
    if (!lead) {
      router.replace('/quiz');
      return;
    }
    setRestoring(true);
    fetch(`/api/quiz?id=${encodeURIComponent(lead)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { id: string; answers: QuizAnswers; locale: string; headline: string | null }) => {
        (Object.keys(data.answers) as (keyof QuizAnswers)[]).forEach((k) => answer(k, data.answers[k] as never));
        setResult(data.id, data.headline);
        if (!localeChosen && isLocale(data.locale)) setLocale(data.locale);
      })
      .catch(() => router.replace('/quiz'))
      .finally(() => setRestoring(false));
  }, [hydrated, parsed, params, router, answer, setResult, setLocale, localeChosen]);

  useEffect(() => {
    if (parsed) track('view_offer', { persona: personaOf(parsed) });
  }, [parsed]);

  const value = useMemo<OfferContextValue | null>(() => {
    if (!parsed) return null;
    return {
      answers: parsed,
      persona: personaOf(parsed),
      recommended: recommendedPlan(parsed),
      name: contact.name.trim().split(' ')[0] ?? '',
      headline,
      choosePlan: (plan: PlanId) => {
        setPlan(plan);
        router.push('/checkout');
      },
    };
  }, [parsed, contact.name, headline, setPlan, router]);

  if (!hydrated || restoring || !value) {
    return <div className="flex min-h-[100dvh] items-center justify-center bg-ink" aria-busy="true" />;
  }

  return (
    <OfferContext.Provider value={value}>
      <ScrollProgress />
      <GoldCursor />
      <main>
        <div style={{ scrollSnapAlign: 'start' }}>
          <TrustBar />
          <DynamicHero />
        </div>
        <VSLPlayer />
        <DiagnosisCard />
        <PersonalBullets />
        <ScienceCards />
        <TimelineScroll />
        <BeforeAfterSlider />
        <Testimonials />
        <ResultSimulator />
        <ComparisonTable />
        <PricingCards />
        <BonusStack />
        <GuaranteeSeal />
        <SmartFAQ />
      </main>
      <Footer />
      <StickyCTA />
      <ExitIntent />
      <AIChatWidget />
      <LiveSocialProof />
    </OfferContext.Provider>
  );
}
