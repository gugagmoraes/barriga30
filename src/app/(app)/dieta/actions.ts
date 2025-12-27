'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateInitialDiet(userId: string) {
  const supabase = await createClient()

  // Call the Postgres function we created in the migration
  const { error } = await supabase.rpc('generate_initial_diet_snapshot', {
    target_user_id: userId
  })

  if (error) {
    console.error('Error generating diet snapshot:', error)
    throw new Error('Failed to generate diet snapshot')
  }

  revalidatePath('/dieta')
}
