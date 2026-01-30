'use server'

import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/services/gamification'
import { checkAndUnlockBadges } from '@/services/badges'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function completeWorkout(workoutId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // FETCH WORKOUT DETAILS to log metadata correctly for progression
  const { data: workout } = await supabase.from('workouts').select('*').eq('id', workoutId).single();
  
  // If workout not found in DB (e.g. old mocked IDs), fallback or ignore metadata
  // But we migrated to real IDs.
  // For safety with old frontend using '1', '2', '3':
  let level = 'beginner';
  let type = 'A';
  
  if (workout) {
      level = workout.level;
      type = workout.type;
  } else {
      // Fallback for mocked IDs
      if (workoutId === '1') { level = 'beginner'; type = 'A'; }
      if (workoutId === '2') { level = 'beginner'; type = 'B'; }
      if (workoutId === '3') { level = 'beginner'; type = 'C'; }
  }

  // 1. Log Activity
  const today = new Date().toISOString().split('T')[0]
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('user_activity_log')
    .select('id')
    .eq('user_id', user.id)
    .eq('activity_type', 'workout_completed')
    .eq('metadata->>workoutId', workoutId)
    .eq('metadata->>date', today)
    .limit(1)

  if (existing && existing.length > 0) {
    return { success: false, error: 'duplicate', xpEarned: 0, newBadges: [] as string[] }
  }

  const result = await logActivity({
    userId: user.id,
    type: 'workout_completed',
    xp: 50,
    metadata: { 
        workoutId, 
        date: today,
        level, // Crucial for progression counting
        type   // Crucial for progression counting
    }
  })

  // 2. Check for Badges
  const newBadges = await checkAndUnlockBadges(user.id)

  if (!result.success && result.reason !== 'duplicate') {
    console.error('Failed to log workout completion', result.error)
  }

  revalidatePath('/dashboard')
  if (!result.success) {
    if (result.reason === 'duplicate') {
      return { success: false, error: 'duplicate', xpEarned: 0, newBadges: [] as string[] }
    }
    return { success: false, error: 'failed_to_log_activity', xpEarned: 0, newBadges: [] as string[] }
  }

  return { success: true, xpEarned: 50, newBadges }
}
