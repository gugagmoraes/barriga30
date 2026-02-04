'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { WorkoutLevel } from '@/services/progression'

export async function updateUserWorkoutLevel(userId: string, newLevel: WorkoutLevel) {
  const supabase = createAdminClient()

  // Verify if user is Plus or VIP to allow manual change (Security check)
  // Although the UI hides it, we should verify in backend too.
  const { data: user } = await supabase.from('users').select('plan_type').eq('id', userId).single()
  
  if (!user || (user.plan_type !== 'plus' && user.plan_type !== 'vip')) {
      return { success: false, message: 'Plano não permite troca manual de nível.' }
  }

  const { error } = await supabase
    .from('users')
    .update({ workout_level: newLevel })
    .eq('id', userId)

  if (error) {
    console.error('Error updating level:', error)
    return { success: false, message: 'Erro ao atualizar nível.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/treinos')
  return { success: true }
}
