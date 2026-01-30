'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAndUnlockBadges } from '@/services/badges'
import { revalidatePath } from 'next/cache'

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

  const today = new Date().toISOString().split('T')[0]

  let ok = false
  let reason: string | undefined
  let xpEarned = 50

  const { data: rpcResult, error: rpcError } = await supabase.rpc('complete_workout', { p_workout_id: workoutId })
  ok = !!(rpcResult && (rpcResult as any).success)
  if (!ok) {
    reason = rpcError ? 'failed_to_complete' : (rpcResult as any)?.reason

    const admin = createAdminClient()
    if (admin && reason !== 'unauthorized') {
      const { data: existing } = await admin
        .from('user_activity_log')
        .select('id')
        .eq('user_id', user.id)
        .eq('activity_type', 'workout_completed')
        .eq('reference_id', workoutId)
        .contains('metadata', { date: today })
        .limit(1)

      if (existing && existing.length > 0) {
        ok = false
        reason = 'duplicate'
      } else {
        const { error: insertError } = await admin.from('user_activity_log').insert({
          user_id: user.id,
          activity_type: 'workout_completed',
          reference_id: workoutId,
          xp_earned: 50,
          metadata: { workoutId, date: today, level, type },
        })

        if (!insertError) {
          ok = true
          reason = undefined
        }
      }
    }
  } else {
    xpEarned = (rpcResult as any).xp ?? 50
  }

  const newBadges = await checkAndUnlockBadges(user.id)
  revalidatePath('/dashboard')

  if (!ok) {
    if (reason === 'duplicate') {
      return { success: false, error: 'duplicate', xpEarned: 0, newBadges: [] as string[] }
    }
    if (reason === 'unauthorized') {
      return { success: false, error: 'unauthorized', xpEarned: 0, newBadges: [] as string[] }
    }
    return { success: false, error: 'failed_to_complete', xpEarned: 0, newBadges: [] as string[] }
  }

  return { success: true, xpEarned, newBadges }
}
