import { json } from '@/lib/http';
import { db } from '@/lib/supabase';

// Cached for 5 minutes: real paid orders in the last 24h, as a count only (no names, no cities).
export const revalidate = 300;

export async function GET() {
  const supabase = db();
  if (!supabase) return json({ count: 0 });
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'paid')
    .gte('created_at', since);
  if (error) console.error('social proof count failed', error);
  return json({ count: count ?? 0 });
}
