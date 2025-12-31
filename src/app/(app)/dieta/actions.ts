'use server'

import { revalidatePath } from 'next/cache'
import { generateDietForUser } from '@/services/diet.service'
import { createClient } from '@/lib/supabase/server'

export async function generateInitialDiet(userId: string) {
  await generateDietForUser(userId)
  revalidatePath('/dieta')
}

export async function resetDiet(userId: string) {
  const supabase = await createClient()
  
  // Archive active snapshot
  await supabase.from('diet_snapshots')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true)
    
  // Archive active preferences
  await supabase.from('diet_preferences')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true)

  revalidatePath('/dieta')
  revalidatePath('/lista-compras')
  return { success: true }
}
