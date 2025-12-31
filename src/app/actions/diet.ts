'use server'

import { createClient } from '@/lib/supabase/server'
import { generateDietForUser } from '@/services/diet.service'
import { revalidatePath } from 'next/cache'

type RegenerateInput = {
  weight: number
  height: number
  age: number
}

export async function saveDietPreferences(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const selectedProteins = JSON.parse(formData.get('selected_proteins') as string || '[]')
        const selectedCarbs = JSON.parse(formData.get('selected_carbs') as string || '[]')
        const selectedVeggies = JSON.parse(formData.get('selected_veggies') as string || '[]')
        const selectedFruits = JSON.parse(formData.get('selected_fruits') as string || '[]')
        const noVeggies = formData.get('no_veggies') === 'true'
        const noFruits = formData.get('no_fruits') === 'true'

        const preferences = {
            user_id: user.id,
            age: Number(formData.get('age')),
            gender: formData.get('gender') as string,
            weight: Number(formData.get('weight')),
            height: Number(formData.get('height')),
            workout_frequency: formData.get('workout_frequency') as string,
            workout_duration: formData.get('workout_duration') as string,
            food_preferences: {
                proteins: selectedProteins,
                carbs: selectedCarbs,
                veggies: selectedVeggies,
                fruits: selectedFruits,
                no_veggies: noVeggies,
                no_fruits: noFruits
            },
            water_bottle_size_ml: Number(formData.get('water_bottle_size_ml'))
        }

        console.log('[saveDietPreferences] Starting preference save for user:', user.id)

        // Archive old active preferences
        const { error: archiveError } = await supabase
            .from('diet_preferences')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('is_active', true)
        
        if (archiveError) console.error('[saveDietPreferences] Archive error:', archiveError)

        // Insert new preferences (active by default)
        const { error } = await supabase
            .from('diet_preferences')
            .insert({
                ...preferences,
                is_active: true
            })

        if (error) {
             console.error('[saveDietPreferences] Insert error:', error)
             throw error
        }

        // Update User Profile basics as well to keep in sync
        const { error: userError } = await supabase.from('users').update({
            weight: preferences.weight,
            height: preferences.height,
            age: preferences.age,
            gender: preferences.gender
        }).eq('id', user.id)

        if (userError) console.error('[saveDietPreferences] User update error:', userError)

        // Generate Diet Immediately
        console.log('[saveDietPreferences] Triggering diet generation...')
        await generateDietForUser(user.id)
        console.log('[saveDietPreferences] Diet generation complete.')

        revalidatePath('/dieta')
        revalidatePath('/lista-compras')
        return { success: true }
    } catch (e) {
        console.error('[saveDietPreferences] Failed to save preferences:', e)
        return { success: false, error: String(e) }
    }
}

export async function regenerateDietAction(input: RegenerateInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    // 1. Update User Biometrics
    const { error: updateError } = await supabase
        .from('users')
        .update({
            weight: input.weight,
            height: input.height,
            age: input.age
        })
        .eq('id', user.id)

    // Also update preferences if they exist
    await supabase.from('diet_preferences').update({
        weight: input.weight,
        height: input.height,
        age: input.age
    }).eq('user_id', user.id)

    if (updateError) throw new Error('Failed to update profile')

    // 2. Generate New Diet Snapshot
    // The service handles limits check internally
    await generateDietForUser(user.id)

    revalidatePath('/dieta')
    revalidatePath('/lista-compras')
    return { success: true }

  } catch (e: any) {
    console.error('Regeneration failed:', e)
    // Extract message if it's a known error (like limit reached)
    return { success: false, error: e.message || 'Failed to regenerate diet' }
  }
}
