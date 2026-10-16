import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { siteUrl } from './site';

/**
 * Email (Resend) and SMS (Twilio) over their REST APIs — no SDKs needed.
 * Both are no-ops that log a warning when not configured, so dev works offline.
 */

export async function sendEmail(to: string, subject: string, text: string, unsubscribeUrl?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn(`[email skipped — RESEND_API_KEY/EMAIL_FROM not set] ${subject} → ${to}`);
    return false;
  }
  const address = process.env.COMPANY_POSTAL_ADDRESS ?? '';
  const body = [text, '', '—', address, unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : ''].filter(Boolean).join('\n');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: body,
      headers: unsubscribeUrl
        ? { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
        : undefined,
    }),
  });
  if (!res.ok) console.error('Resend error', res.status, await res.text());
  return res.ok;
}

export async function sendSms(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.warn(`[sms skipped — Twilio not configured] → ${to}`);
    return false;
  }
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  if (!res.ok) console.error('Twilio error', res.status, await res.text());
  return res.ok;
}

/** Optional: forward lead events to a Make.com (or Zapier) webhook. */
export async function forwardLead(event: string, payload: Record<string, unknown>): Promise<void> {
  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, ...payload }),
    });
  } catch (error) {
    console.error('Make webhook failed', error);
  }
}

function secret(): string {
  const s = process.env.UNSUBSCRIBE_SECRET;
  if (!s) throw new Error('UNSUBSCRIBE_SECRET is not set');
  return s;
}

export function unsubscribeToken(quizId: string): string {
  return createHmac('sha256', secret()).update(quizId).digest('base64url');
}

export function verifyUnsubscribeToken(quizId: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(quizId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(quizId: string): string {
  return `${siteUrl()}/api/unsubscribe?id=${quizId}&token=${unsubscribeToken(quizId)}`;
}
