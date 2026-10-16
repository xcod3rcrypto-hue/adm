import type { NextRequest } from 'next/server';
import { verifyUnsubscribeToken } from '@/lib/notify';
import { db } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function unsubscribe(req: NextRequest): Promise<Response> {
  const id = req.nextUrl.searchParams.get('id') ?? '';
  const token = req.nextUrl.searchParams.get('token') ?? '';
  const supabase = db();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !verifyUnsubscribeToken(id, token) || !supabase) {
    return new Response('Invalid link', { status: 400 });
  }
  await supabase
    .from('quiz_responses')
    .update({ unsubscribed: true, marketing_consent: false, sms_consent: false })
    .eq('id', id);
  return new Response('<!doctype html><meta charset="utf-8"><title>Unsubscribed</title><p style="font-family:system-ui;padding:2rem">You have been unsubscribed. / Inscrição cancelada.</p>', {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// GET for the link in the email, POST for RFC 8058 one-click unsubscribe.
export const GET = unsubscribe;
export const POST = unsubscribe;
