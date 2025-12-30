'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWorkoutCompletion(date: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get current status
    const { data: current } = await supabase
        .from('daily_tracking')
        .select('workout_completed')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()

    const newValue = !current?.workout_completed

    const { error } = await supabase
        .from('daily_tracking')
        .upsert({
            user_id: user.id,
            date: date,
            workout_completed: newValue
        }, { onConflict: 'user_id, date' })

    if (error) console.error(error)
    revalidatePath('/dashboard')
    revalidatePath('/treinos')
}

export async function updateWaterIntake(date: string, amount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get current
    const { data: current } = await supabase
        .from('daily_tracking')
        .select('water_ml')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()
    
    const currentAmount = current?.water_ml || 0
    const newAmount = Math.max(0, currentAmount + amount)

    const { error } = await supabase
        .from('daily_tracking')
        .upsert({
            user_id: user.id,
            date: date,
            water_ml: newAmount
        }, { onConflict: 'user_id, date' })

    if (error) console.error(error)
    revalidatePath('/dieta')
}

export async function toggleMealCompletion(date: string, increment: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: current } = await supabase
        .from('daily_tracking')
        .select('meals_completed')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()
    
    const currentCount = current?.meals_completed || 0
    const newCount = Math.max(0, currentCount + (increment ? 1 : -1))

    const { error } = await supabase
        .from('daily_tracking')
        .upsert({
            user_id: user.id,
            date: date,
            meals_completed: newCount
        }, { onConflict: 'user_id, date' })

    if (error) console.error(error)
    revalidatePath('/dieta')
}
