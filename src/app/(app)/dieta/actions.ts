'use server'

import { revalidatePath } from 'next/cache'
import { generateDietForUser } from '@/services/diet.service'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function generateInitialDiet() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await generateDietForUser(user.id)
  revalidatePath('/dieta')
}

export async function resetDiet() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Using Admin Client for consistency and to bypass RLS issues if any
  const adminClient = createAdminClient()
  if (!adminClient) throw new Error('Admin client error')
  
  // Archive active snapshot
  await adminClient.from('diet_snapshots')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true)
    
  // Archive active preferences
  await adminClient.from('diet_preferences')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true)

  revalidatePath('/dieta')
  revalidatePath('/lista-compras')
  return { success: true }
}
