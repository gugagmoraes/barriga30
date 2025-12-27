import { createClient } from '@/lib/supabase/server';

export type ActivityType = 'workout_completed' | 'diet_checked' | 'water_logged' | 'daily_login';

interface LogActivityParams {
  userId: string;
  type: ActivityType;
  referenceId?: string;
  xp: number;
  metadata?: Record<string, any>;
}

export async function logActivity({ userId, type, referenceId, xp, metadata }: LogActivityParams) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('user_activity_log')
      .insert({
        user_id: userId,
        activity_type: type,
        reference_id: referenceId,
        xp_earned: xp,
        metadata: metadata || {},
      });

    if (error) {
      // Check for unique constraint violation (code 23505 in Postgres)
      // This happens if we try to log the same referenceId twice (e.g. same workout)
      // We silently ignore this as it's not a critical system error, just a rule enforcement.
      if (error.code === '23505') {
        console.warn(`Duplicate activity ignored: ${type} for user ${userId} ref ${referenceId}`);
        return { success: false, reason: 'duplicate' };
      }
      
      console.error('Error logging gamification activity:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in logActivity:', err);
    return { success: false, error: err };
  }
}
