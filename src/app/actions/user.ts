'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { WorkoutLevel } from '@/services/progression'
import { createClient } from '@/lib/supabase/server'

export async function updateUserWorkoutLevel(newLevel: WorkoutLevel) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, message: 'Usuário não autenticado.' }

  const admin = createAdminClient()
  if (!admin) return { success: false, message: 'Configuração do Supabase ausente.' }

  const { data: profile } = await admin.from('users').select('plan_type').eq('id', user.id).single()

  if (!profile || (profile.plan_type !== 'plus' && profile.plan_type !== 'vip')) {
    return { success: false, message: 'Plano não permite troca manual de nível.' }
  }

  const { error } = await admin.from('users').update({ workout_level: newLevel }).eq('id', user.id)

  if (error) {
    console.error('Error updating level:', error)
    return { success: false, message: 'Erro ao atualizar nível.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/treinos')
  return { success: true }
}
