'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const XP_PER_WATER_DAILY_GOAL = 50
const XP_PER_MEAL = 15

export async function addWater(bottleSizeMl: number, dailyGoalMl: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized', xpEarned: 0 }

  const admin = createAdminClient()
  if (!admin) return { success: false, error: 'Server misconfigured', xpEarned: 0 }

  const userId = user.id
  const today = new Date().toISOString().split('T')[0]

  let { data: tracking } = await admin
    .from('daily_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (!tracking) {
    const { data: newTracking, error } = await admin
      .from('daily_tracking')
      .insert({ user_id: userId, date: today, water_ml: 0, meals_completed: 0, workout_completed: false })
      .select()
      .single()
    
    if (error) return { success: false, error: 'Failed to init daily tracking', xpEarned: 0 }
    tracking = newTracking
  }

  const currentAmount = tracking.water_ml || 0
  if (currentAmount >= dailyGoalMl) {
    revalidatePath('/dashboard')
    return { success: true, xpEarned: 0, newTotal: currentAmount }
  }

  const newAmount = Math.min(currentAmount + bottleSizeMl, dailyGoalMl)

  let xpEarned = 0
  const reachedGoal = newAmount >= dailyGoalMl

  const { error: updateError } = await admin
    .from('daily_tracking')
    .update({ water_ml: newAmount })
    .eq('id', tracking.id)

  if (updateError) return { success: false, error: 'Failed to update water', xpEarned: 0 }

  if (reachedGoal) {
    const { data: existing } = await admin
      .from('user_activity_log')
      .select('id')
      .eq('user_id', userId)
      .eq('activity_type', 'water_logged')
      .contains('metadata', { date: today, kind: 'water_goal' })
      .limit(1)

    if (!existing || existing.length === 0) {
      xpEarned = XP_PER_WATER_DAILY_GOAL
      await admin.from('user_activity_log').insert({
        user_id: userId,
        activity_type: 'water_logged',
        xp_earned: xpEarned,
        metadata: { date: today, kind: 'water_goal', goal_ml: dailyGoalMl },
      })
    }
  }

  revalidatePath('/dashboard')
  return { success: true, xpEarned, newTotal: newAmount }
}

export async function removeWater(bottleSizeMl: number, dailyGoalMl: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized', xpEarned: 0 }
  const admin = createAdminClient()
  if (!admin) return { success: false, error: 'Server misconfigured', xpEarned: 0 }

  const userId = user.id
  const today = new Date().toISOString().split('T')[0]

  const { data: tracking } = await admin
    .from('daily_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (!tracking) {
    revalidatePath('/dashboard')
    return { success: true, xpEarned: 0, newTotal: 0 }
  }

  const currentAmount = tracking.water_ml || 0
  if (currentAmount <= 0) {
    revalidatePath('/dashboard')
    return { success: true, xpEarned: 0, newTotal: 0 }
  }

  const newAmount = Math.max(0, currentAmount - bottleSizeMl)

  const { error } = await admin
    .from('daily_tracking')
    .update({ water_ml: newAmount })
    .eq('id', tracking.id)

  if (error) return { success: false, error: 'Failed to update water', xpEarned: 0 }

  revalidatePath('/dashboard')
  return { success: true, xpEarned: 0, newTotal: newAmount }
}

export async function toggleMeal(mealIndex: number, isCompleted: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized', xpEarned: 0 }

  const admin = createAdminClient()
  if (!admin) return { success: false, error: 'Server misconfigured', xpEarned: 0 }

  const userId = user.id
  const today = new Date().toISOString().split('T')[0]

  let { data: tracking } = await admin
    .from('daily_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (!tracking) {
    const { data: newTracking, error } = await admin
      .from('daily_tracking')
      .insert({ user_id: userId, date: today, water_ml: 0, meals_completed: 0, workout_completed: false })
      .select()
      .single()
    if (error) return { success: false, error: 'Failed to init daily tracking', xpEarned: 0 }
    tracking = newTracking
  }

  const currentCount = tracking.meals_completed || 0
  if (isCompleted) {
    if (mealIndex !== currentCount) return { success: true, xpEarned: 0, mealsCompleted: currentCount }
    const newCount = Math.min(4, currentCount + 1)
    const { error } = await admin.from('daily_tracking').update({ meals_completed: newCount }).eq('id', tracking.id)
    if (error) return { success: false, error: 'Failed to update meal', xpEarned: 0 }

    await admin.from('user_activity_log').insert({
      user_id: userId,
      activity_type: 'diet_checked',
      xp_earned: XP_PER_MEAL,
      metadata: { date: today, mealIndex },
    })

    revalidatePath('/dashboard')
    return { success: true, xpEarned: XP_PER_MEAL, mealsCompleted: newCount }
  }

  if (mealIndex !== currentCount - 1) return { success: true, xpEarned: 0, mealsCompleted: currentCount }
  const newCount = Math.max(0, currentCount - 1)
  const { error } = await admin.from('daily_tracking').update({ meals_completed: newCount }).eq('id', tracking.id)
  if (error) return { success: false, error: 'Failed to update meal', xpEarned: 0 }

  await admin.from('user_activity_log').insert({
    user_id: userId,
    activity_type: 'diet_checked',
    xp_earned: -XP_PER_MEAL,
    metadata: { date: today, mealIndex },
  })

  revalidatePath('/dashboard')
  return { success: true, xpEarned: 0, mealsCompleted: newCount }
}
