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
  await supabase.from('diet_snapshots').delete().eq('user_id', userId)
  revalidatePath('/dieta')
  revalidatePath('/lista-compras')
  return { success: true }
}
