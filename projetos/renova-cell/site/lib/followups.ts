import 'server-only';
import { format, getDictionary, isLocale, type Locale } from './i18n';
import { sendEmail, sendSms, unsubscribeUrl } from './notify';
import { siteUrl } from './site';

/**
 * Post-quiz sequence for people who did not buy.
 * Step 0 (diagnosis email) is sent right away by /api/quiz; the cron sends the rest.
 * Marketing steps only go to people who ticked the consent box; SMS only with SMS consent.
 */
export const FOLLOWUPS = [
  { step: 1, afterMinutes: 30, channel: 'email', key: 'vsl' },
  { step: 2, afterMinutes: 120, channel: 'sms', key: 'sms' },
  { step: 3, afterMinutes: 60 * 24, channel: 'email', key: 'socialProof' },
  { step: 4, afterMinutes: 60 * 72, channel: 'email', key: 'lastChance' },
  { step: 5, afterMinutes: 60 * 24 * 7, channel: 'email', key: 'story' },
] as const;

export const LAST_STEP = FOLLOWUPS.length;

export interface LeadRow {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  locale: string | null;
  marketing_consent: boolean;
  sms_consent: boolean;
}

export function offerLink(quizId: string, source: string): string {
  return `${siteUrl()}/offer?lead=${quizId}&utm_source=${source}&utm_medium=followup`;
}

/** Sends one follow-up if the lead consented to that channel. Returns true when something was sent. */
export async function sendFollowup(lead: LeadRow, followup: (typeof FOLLOWUPS)[number]): Promise<boolean> {
  const locale: Locale = isLocale(lead.locale) ? lead.locale : 'en';
  const d = getDictionary(locale).emails;
  const link = offerLink(lead.id, followup.channel);

  if (followup.channel === 'sms') {
    if (!lead.sms_consent || !lead.phone) return false;
    return sendSms(lead.phone, format(d.sms.body, { link }));
  }
  if (!lead.marketing_consent || !lead.email) return false;
  const template = d[followup.key as 'vsl' | 'socialProof' | 'lastChance' | 'story'];
  const text = `${format(template.body, { link, name: lead.first_name ?? '' })}\n\n${d.footer}`;
  return sendEmail(lead.email, format(template.subject, { name: lead.first_name ?? '' }), text, unsubscribeUrl(lead.id));
}
