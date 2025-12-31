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

        // Save Preferences
        const { error } = await supabase
            .from('diet_preferences')
            .upsert(preferences)

        if (error) throw error

        // Update User Profile basics as well to keep in sync
        await supabase.from('users').update({
            weight: preferences.weight,
            height: preferences.height,
            age: preferences.age,
            gender: preferences.gender
        }).eq('id', user.id)

        // Generate Diet Immediately
        await generateDietForUser(user.id)

        revalidatePath('/dieta')
        revalidatePath('/lista-compras')
        return { success: true }
    } catch (e) {
        console.error('Failed to save preferences:', e)
        return { success: false }
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
