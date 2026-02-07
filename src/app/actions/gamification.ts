'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Configurable constants
const XP_PER_WATER_DAILY_GOAL = 50 // Fixed XP per day for hitting goal
const XP_PER_MEAL = 15 // Updated from 50 to 15

export async function addWater(userId: string, bottleSizeMl: number, dailyGoalMl: number) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // 1. Get or Create Daily Tracking
  let { data: tracking } = await supabase
    .from('daily_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (!tracking) {
    const { data: newTracking, error } = await supabase
      .from('daily_tracking')
      .insert({ user_id: userId, date: today, water_ml: 0, meals_completed: 0, water_xp_granted: false })
      .select()
      .single()
    
    if (error) return { success: false, error: 'Failed to init daily tracking', xpEarned: 0 }
    tracking = newTracking
  }

  // 2. Update Water
  const newAmount = (tracking.water_ml || 0) + bottleSizeMl
  
  // 3. Check for XP Award (Only once per day when goal reached)
  let xpEarned = 0
  const alreadyGranted = tracking.water_xp_granted || false
  const reachedGoal = newAmount >= dailyGoalMl

  const updatePayload: any = { water_ml: newAmount }
  
  if (reachedGoal && !alreadyGranted) {
      xpEarned = XP_PER_WATER_DAILY_GOAL
      updatePayload.water_xp_granted = true
  } else if (!reachedGoal && alreadyGranted) {
      // User removed water and dropped below goal
      // Reset granted status so they can earn it again (if they drink up)
      // Note: We do NOT deduct XP from total_xp as per requirement.
      updatePayload.water_xp_granted = false
  }

  const { error: updateError } = await supabase
    .from('daily_tracking')
    .update(updatePayload)
    .eq('id', tracking.id)

  if (updateError) return { success: false, error: 'Failed to update water', xpEarned: 0 }

  // 4. Log XP if earned
  if (xpEarned > 0) {
      // Add XP to user_stats AND users table (syncing both for safety/migration)
      
      // Update users table (Primary requirement)
      // We first fetch current XP to increment safely if RPC not available for users table
      const { data: user } = await supabase.from('users').select('total_xp').eq('id', userId).single()
      if (user) {
          const currentXp = user.total_xp || 0
          await supabase.from('users').update({ total_xp: currentXp + xpEarned }).eq('id', userId)
      }

      // Keep user_stats in sync (Legacy/Secondary)
      const { error: statsError } = await supabase.rpc('increment_user_xp', { 
          x_user_id: userId, 
          x_amount: xpEarned 
      })
      
      if (statsError) {
          const { data: stats } = await supabase.from('user_stats').select('total_xp').eq('user_id', userId).single()
          if (stats) {
              await supabase.from('user_stats').update({ total_xp: (stats.total_xp || 0) + xpEarned }).eq('user_id', userId)
          }
      }

      await supabase.from('user_activity_log').insert({
        user_id: userId,
        activity_type: 'water_goal_reached',
        xp_earned: xpEarned,
        metadata: { date: today, goal: dailyGoalMl }
      })
  }

  revalidatePath('/dashboard')
  return { success: true, xpEarned: xpEarned, newTotal: newAmount }
}

export async function toggleMeal(userId: string, mealIndex: number, isCompleted: boolean) {
  // Note: Since 'daily_tracking' only stores a count 'meals_completed', 
  // checking individual checkboxes requires a slightly smarter approach or state.
  // For MVP simplicity without a meals table, we'll store a bitmask or array in metadata 
  // OR just trust the client count increment. 
  // BETTER MVP APPROACH: 'daily_tracking' has 'meals_completed' (number).
  // But to support checkboxes (Breakfast, Lunch...), we need to know WHICH ones are done.
  // Let's assume for now we just Increment/Decrement count based on action, 
  // but ideally we should store { breakfast: true, lunch: false } in a JSON column or new table.
  // 
  // Looking at schema: 'daily_tracking' has 'meals_completed' (int).
  // Let's check 'user_activity_log' to see what was logged today for persistence? Too slow.
  // 
  // DECISION: We will add a JSON column 'meals_data' to 'daily_tracking' via migration?
  // OR use 'user_activity_log' as the source of truth for the UI state?
  // 
  // Let's stick to simple increment for XP, but we need state persistence for the UI checkboxes.
  // I'll create a quick migration to add `meals_data` jsonb to `daily_tracking` to store {0: true, 1: false...}
  //
  // WAIT: I can't easily migrate in this turn without SQL access via tool (I have Write tool).
  // I will create a migration file.
  
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // 1. Get Tracking
  let { data: tracking } = await supabase
    .from('daily_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

   if (!tracking) {
    const { data: newTracking } = await supabase
      .from('daily_tracking')
      .insert({ user_id: userId, date: today, water_ml: 0, meals_completed: 0 })
      .select()
      .single()
    tracking = newTracking
  }
  
  // We need to store which meals are done. 
  // Since I can't rely on a new column immediately being there without running migration,
  // I'll try to use `user_activity_log` to reconstruct state on load, 
  // AND log the action.
  
  // Actually, I'll write the migration file first thing in the plan.
  // Assuming the column `meals_data` exists (I will add it).
  
  // Logic with `meals_data` (JSONB):
  const currentData = (tracking.meals_data as Record<string, boolean>) || {}
  const wasCompleted = !!currentData[mealIndex]
  
  if (wasCompleted === isCompleted) return { success: true, xpEarned: 0 } // No change

  const newData = { ...currentData, [mealIndex]: isCompleted }
  
  // Calculate new count
  const newCount = Object.values(newData).filter(Boolean).length

  // Update Tracking
  const { error } = await supabase
    .from('daily_tracking')
    .update({ 
        meals_completed: newCount,
        meals_data: newData
    })
    .eq('id', tracking.id)

  if (error) return { success: false, error: 'Failed to update meal', xpEarned: 0 }

  // XP Logic
  let xpEarned = 0
  
  if (isCompleted) {
      xpEarned = XP_PER_MEAL
      await supabase.from('user_activity_log').insert({
        user_id: userId,
        activity_type: 'meal_logged',
        xp_earned: xpEarned,
        metadata: { mealIndex, date: today }
      })
  } else {
      // Meal unchecked -> Remove XP
      xpEarned = -XP_PER_MEAL
      // We don't delete the log, but we add a negative log or just update total_xp?
      // Requirement: "total_xp of user MUST be decremented".
      // Let's just update total_xp.
  }

  // Update User Total XP
  if (xpEarned !== 0) {
      // Update users table (Primary requirement)
      const { data: user } = await supabase.from('users').select('total_xp').eq('id', userId).single()
      if (user) {
          const currentXp = user.total_xp || 0
          // Allow negative xp (decrement) but usually prevent going below 0? 
          // Req: "total_xp of user MUST be decremented".
          const newTotal = Math.max(0, currentXp + xpEarned)
          await supabase.from('users').update({ total_xp: newTotal }).eq('id', userId)
      }

      // Update user_stats (Legacy/Sync)
      const { error: statsError } = await supabase.rpc('increment_user_xp', { 
          x_user_id: userId, 
          x_amount: xpEarned 
      })
      
      if (statsError) {
          const { data: stats } = await supabase.from('user_stats').select('total_xp').eq('user_id', userId).single()
          if (stats) {
              await supabase.from('user_stats').update({ total_xp: Math.max(0, (stats.total_xp || 0) + xpEarned) }).eq('user_id', userId)
          }
      }
  }

  revalidatePath('/dashboard')
  return { success: true, xpEarned: isCompleted ? xpEarned : 0 } // Return positive for UI toast or 0 if removed (no toast needed for removal usually)
}
