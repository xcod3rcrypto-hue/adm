import type { Dictionary } from './en';

/**
 * The dictionary paid-ad visitors and ad reviewers get (lib/market.ts): the few strings that
 * talk about desire are swapped for their `neutral` versions, so they are not in the page
 * at all — not just hidden.
 */
export function adSafeDictionary(d: Dictionary): Dictionary {
  const { quiz, offer, neutral } = d;
  return {
    ...d,
    quiz: {
      ...quiz,
      intro: neutral.intro,
      questions: {
        ...quiz.questions,
        pain: { ...quiz.questions.pain, options: { ...quiz.questions.pain.options, libido: neutral.painLibido } },
      },
    },
    offer: {
      ...offer,
      hero: { ...offer.hero, sub: neutral.heroSub },
      bullets: {
        ...offer.bullets,
        items: { ...offer.bullets.items, libido: [neutral.bullet, ...offer.bullets.items.libido.slice(1)] },
      },
      pillars: { ...offer.pillars, items: offer.pillars.items.map((item, i) => (i === 1 ? neutral.pillar : item)) },
    },
  };
}
