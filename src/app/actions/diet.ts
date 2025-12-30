'use server'

import { createClient } from '@/lib/supabase/server'
import { generateDietForUser } from '@/services/diet.service'
import { revalidatePath } from 'next/cache'

type RegenerateInput = {
  weight: number
  height: number
  age: number
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

    if (updateError) throw new Error('Failed to update profile')

    // 2. Generate New Diet Snapshot
    // The service handles limits check internally
    await generateDietForUser(user.id)

    revalidatePath('/dieta')
    return { success: true }

  } catch (e: any) {
    console.error('Regeneration failed:', e)
    // Extract message if it's a known error (like limit reached)
    return { success: false, error: e.message || 'Failed to regenerate diet' }
  }
}
