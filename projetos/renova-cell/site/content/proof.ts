/**
 * Social proof content. Intentionally EMPTY: add only real customers who gave written
 * permission, with unedited photos. Sections render nothing while these lists are empty.
 * (FTC Endorsement Guides / CONAR: no invented testimonials, typical results disclosed.)
 */
import type { AgeBand, Gender } from '@/lib/quiz';

export interface Testimonial {
  name: string; // first name + initial, e.g. "Ana R."
  city: string;
  gender: Gender;
  age: AgeBand;
  quote: string;
  photo?: string; // /images/testimonials/...
  consentOnFile: true; // must be literally true — keep the signed permission on file
}

export interface BeforeAfter {
  before: string; // /images/before-after/...
  after: string;
  caption: string; // e.g. "Marta, 52 — 12 weeks of daily use"
  consentOnFile: true;
}

export const TESTIMONIALS: Testimonial[] = [];
export const BEFORE_AFTER: BeforeAfter[] = [];
