'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addWeightRecord(weight: number, date?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        await supabase.from('weight_records').insert({
            user_id: user.id,
            weight: weight,
            recorded_at: date ? new Date(date).toISOString() : new Date().toISOString()
        })

        // Also update current weight in user profile
        await supabase.from('users').update({ weight }).eq('id', user.id)

        revalidatePath('/progresso')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Failed to save weight' }
    }
}

export async function addMeasurements(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        await supabase.from('measurements').insert({
            user_id: user.id,
            ...data
        })
        revalidatePath('/progresso')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Failed to save measurements' }
    }
}
