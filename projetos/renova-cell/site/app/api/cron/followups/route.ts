import type { NextRequest } from 'next/server';
import { FOLLOWUPS, LAST_STEP, sendFollowup, type LeadRow } from '@/lib/followups';
import { json } from '@/lib/http';
import { db } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Vercel Cron (see vercel.json) calls this every 10 minutes with
 * `Authorization: Bearer $CRON_SECRET`. Each lead advances one step per due follow-up;
 * buyers and unsubscribed leads are skipped.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'Unauthorized' }, 401);
  const supabase = db();
  if (!supabase) return json({ error: 'Supabase not configured' }, 500);

  let sent = 0;
  let advanced = 0;
  for (const followup of FOLLOWUPS) {
    const dueBefore = new Date(Date.now() - followup.afterMinutes * 60_000).toISOString();
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('id, email, phone, first_name, locale, marketing_consent, sms_consent')
      .eq('followup_step', followup.step)
      .eq('purchased', false)
      .eq('unsubscribed', false)
      .lte('created_at', dueBefore)
      .limit(100);
    if (error) {
      console.error('followup query failed', error);
      continue;
    }
    for (const lead of (data ?? []) as LeadRow[]) {
      // Advance first so a crash never sends the same message twice.
      const { error: updateError } = await supabase
        .from('quiz_responses')
        .update({ followup_step: Math.min(followup.step + 1, LAST_STEP + 1) })
        .eq('id', lead.id)
        .eq('followup_step', followup.step);
      if (updateError) continue;
      advanced += 1;
      if (await sendFollowup(lead, followup)) sent += 1;
    }
  }
  return json({ advanced, sent });
}
