import type { NextRequest } from 'next/server';
import { generateHeadline } from '@/lib/claude';
import { offerLink } from '@/lib/followups';
import { EMAIL_RE, PHONE_RE, badRequest, clientIp, json, localeOr, rateLimited, readJson } from '@/lib/http';
import { format, getDictionary } from '@/lib/i18n';
import { forwardLead, sendEmail, unsubscribeUrl } from '@/lib/notify';
import { ageMidpoint, estimatedCollagenLossPct, parseAnswers, personaOf, recommendedPlan } from '@/lib/quiz';
import { db } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Body {
  answers?: unknown;
  locale?: unknown;
  variant?: unknown;
  contact?: { name?: string; email?: string; phone?: string; marketingConsent?: boolean; smsConsent?: boolean };
}

/** Saves the answers, generates the headline (variant A) and sends the diagnosis email if asked. */
export async function POST(req: NextRequest) {
  if (rateLimited(`quiz:${clientIp(req)}`, 10, 60_000)) return json({ error: 'Too many requests' }, 429);
  const body = await readJson<Body>(req);
  const answers = parseAnswers(body?.answers);
  if (!body || !answers) return badRequest('Invalid answers');

  const locale = localeOr(body.locale);
  const variant = body.variant === 'B' ? 'B' : 'A';
  const email = body.contact?.email?.trim().toLowerCase() || null;
  const phone = body.contact?.phone?.replace(/[\s()-]/g, '') || null;
  const firstName = body.contact?.name?.trim().slice(0, 60) || null;
  if (email && !EMAIL_RE.test(email)) return badRequest('Invalid email');
  if (phone && !PHONE_RE.test(phone)) return badRequest('Invalid phone');
  const marketingConsent = Boolean(email && body.contact?.marketingConsent);
  const smsConsent = Boolean(phone && body.contact?.smsConsent);

  // Variant B is the control: static headline from the dictionary.
  const headline = variant === 'A' ? await generateHeadline(answers, locale) : null;

  let id: string | null = null;
  const supabase = db();
  if (supabase) {
    const { data, error } = await supabase
      .from('quiz_responses')
      .insert({
        answers,
        country: req.headers.get('x-vercel-ip-country'),
        locale,
        email,
        phone: smsConsent ? phone : null,
        first_name: firstName,
        marketing_consent: marketingConsent,
        sms_consent: smsConsent,
        headline,
        ab_variant: variant,
        followup_step: 1,
      })
      .select('id')
      .single();
    if (error) console.error('quiz insert failed', error);
    id = data?.id ?? null;
  }

  if (id && email) {
    const d = getDictionary(locale);
    const pct = estimatedCollagenLossPct(ageMidpoint(answers.age));
    const diagnosis = format(d.offer.diagnosis.body, { pct });
    const plan = d.offer.pricing.plans[recommendedPlan(answers)].name;
    const text = `${format(d.emails.diagnosis.body, { diagnosis, plan, link: offerLink(id, 'email') })}\n\n${d.offer.diagnosis.note}\n\n${d.emails.footer}`;
    await sendEmail(email, format(d.emails.diagnosis.subject, { name: firstName ?? '' }).replace(/^, /, ''), text, unsubscribeUrl(id));
    await forwardLead('quiz_completed', { id, email, locale, persona: personaOf(answers), marketingConsent, smsConsent });
  }

  return json({ id, headline });
}

/** Restores answers for someone returning from an email link (no personal data returned). */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const supabase = db();
  if (!id || !/^[0-9a-f-]{36}$/i.test(id) || !supabase) return json({ error: 'Not found' }, 404);
  const { data } = await supabase.from('quiz_responses').select('answers, locale, headline').eq('id', id).maybeSingle();
  if (!data) return json({ error: 'Not found' }, 404);
  return json({ id, ...data });
}
