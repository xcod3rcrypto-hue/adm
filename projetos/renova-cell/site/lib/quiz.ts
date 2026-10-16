/** Quiz answer model + the persona / plan logic derived from it. Shared by client and server. */

export const GENDERS = ['male', 'female', 'other'] as const;
export const AGES = ['25-34', '35-44', '45-54', '55+'] as const;
export const PAINS = ['skin', 'energy', 'libido', 'joints', 'all'] as const;
export const DURATIONS = ['lt6m', '6m-2y', '2y+'] as const;
export const HISTORIES = ['never', 'tried', 'using'] as const;
export const GOALS = PAINS;

export type Gender = (typeof GENDERS)[number];
export type AgeBand = (typeof AGES)[number];
export type Pain = (typeof PAINS)[number];
export type Duration = (typeof DURATIONS)[number];
export type History = (typeof HISTORIES)[number];
export type Goal = Pain;

export interface QuizAnswers {
  gender: Gender;
  age: AgeBand;
  pain: Pain;
  duration: Duration;
  history: History;
  energy: number; // 1–10
  confidence: number; // 1–10
  goal: Goal;
}

export type Persona = 'woman' | 'man' | 'senior';
export type PlanId = 'single' | 'kit3' | 'kit6';

const oneOf = <T extends readonly string[]>(list: T, v: unknown): v is T[number] =>
  typeof v === 'string' && (list as readonly string[]).includes(v);
const slider = (v: unknown) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 10;

/** Strict runtime validation for anything that arrives over the network. */
export function parseAnswers(input: unknown): QuizAnswers | null {
  if (!input || typeof input !== 'object') return null;
  const a = input as Record<string, unknown>;
  if (
    oneOf(GENDERS, a.gender) &&
    oneOf(AGES, a.age) &&
    oneOf(PAINS, a.pain) &&
    oneOf(DURATIONS, a.duration) &&
    oneOf(HISTORIES, a.history) &&
    slider(a.energy) &&
    slider(a.confidence) &&
    oneOf(GOALS, a.goal)
  ) {
    return {
      gender: a.gender,
      age: a.age,
      pain: a.pain,
      duration: a.duration,
      history: a.history,
      energy: a.energy as number,
      confidence: a.confidence as number,
      goal: a.goal,
    };
  }
  return null;
}

/**
 * 55+ → senior script (unisex). Otherwise by gender; "prefer not to say" under 55
 * gets the woman script, whose copy is written gender-neutral enough to fit.
 */
export function personaOf(a: Pick<QuizAnswers, 'gender' | 'age'>): Persona {
  if (a.age === '55+') return 'senior';
  return a.gender === 'male' ? 'man' : 'woman';
}

export function recommendedPlan(a: Pick<QuizAnswers, 'gender' | 'age'>): PlanId {
  return personaOf(a) === 'senior' ? 'kit6' : 'kit3';
}

const AGE_MIDPOINT: Record<AgeBand, number> = { '25-34': 30, '35-44': 40, '45-54': 50, '55+': 60 };

export function ageMidpoint(age: AgeBand): number {
  return AGE_MIDPOINT[age];
}

/**
 * Illustrative estimate only: the commonly cited ~1%/year decline from age 25.
 * Never shown without the "estimate, not a measurement" note.
 */
export function estimatedCollagenLossPct(age: number): number {
  return Math.max(0, Math.min(60, Math.round(age - 25)));
}

/** FAQ keys ordered so the user's likely objections come first. */
export function prioritizedFaq(a: QuizAnswers | null): string[] {
  const all = ['different', 'time', 'safe', 'men', 'how', 'cancel', 'shipping'];
  if (!a) return all;
  const first: string[] = [];
  if (a.history === 'tried') first.push('different');
  if (a.duration !== 'lt6m') first.push('time');
  if (a.age === '55+') first.push('safe');
  if (a.gender === 'male') first.push('men');
  if (recommendedPlan(a) === 'kit6') first.push('cancel');
  return [...new Set([...first, ...all])];
}
