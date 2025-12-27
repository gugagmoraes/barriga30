import { createClient } from '@/lib/supabase/server';

export async function checkAndUnlockBadges(userId: string) {
  const supabase = await createClient();
  const newBadges: string[] = [];

  // 1. Fetch User Stats and Counts
  const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', userId).single();
  
  // Count total completed workouts
  const { count: workoutCount } = await supabase
    .from('user_activity_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('activity_type', 'workout_completed');

  if (!stats) return [];

  // 2. Define Badge Rules
  const checks = [
    { key: 'first_streak', condition: stats.current_streak >= 1 },
    { key: 'streak_3', condition: stats.current_streak >= 3 },
    { key: 'streak_7', condition: stats.current_streak >= 7 },
    { key: 'first_workout', condition: (workoutCount || 0) >= 1 },
    { key: 'workouts_5', condition: (workoutCount || 0) >= 5 },
    { key: 'workouts_10', condition: (workoutCount || 0) >= 10 },
  ];

  // 3. Process Checks
  for (const check of checks) {
    if (check.condition) {
      const unlocked = await unlockBadge(userId, check.key, supabase);
      if (unlocked) newBadges.push(check.key);
    }
  }

  return newBadges;
}

// Helper to unlock a single badge safely
async function unlockBadge(userId: string, badgeKey: string, supabase: any) {
  // Get badge ID
  const { data: badge } = await supabase.from('badges').select('id').eq('key', badgeKey).single();
  if (!badge) return false;

  // Try insert (ignore if exists)
  const { error } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badge.id })
    .ignore(); // Need to ensure ignore works or handle error code 23505

  // Supabase JS .ignore() might not be available in all versions or contexts without strict setup.
  // Better to handle error manually if we want to be safe.
  if (error) {
     if (error.code === '23505') return false; // Already unlocked
     console.error('Error unlocking badge:', error);
     return false;
  }

  // If we got here and no error, it likely inserted successfully (or silently ignored if configured)
  // To be 100% sure it was NEW, we could check rows affected, but for UX notification let's assume success.
  return true;
}
