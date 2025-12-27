import { createClient } from '@/lib/supabase/server';

export interface RankingEntry {
  user_id: string;
  name: string;
  plan: string;
  weekly_xp: number;
  rank?: number; // Calculated in frontend or SQL
}

export async function getWeeklyRanking() {
  const supabase = await createClient();

  // Call the secure RPC function created in migration 08
  const { data, error } = await supabase.rpc('get_weekly_ranking');

  if (error) {
    console.error('Error fetching ranking:', error);
    return [];
  }

  return data as RankingEntry[];
}
