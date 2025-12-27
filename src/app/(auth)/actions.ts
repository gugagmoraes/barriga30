'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/schemas/auth'
import { createCheckoutSession } from '@/services/stripe'
import { logActivity } from '@/services/gamification'

export async function login(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  
  // 1. Validar dados com Zod
  const validation = loginSchema.safeParse(data)
  
  if (!validation.success) {
    return { error: (validation.error as any).errors[0].message }
  }

  const { email, password } = validation.data

  const supabase = await createClient()

  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // GAMIFICATION: Log Daily Login
  if (authData.user) {
    const today = new Date().toISOString().split('T')[0]
    await logActivity({
        userId: authData.user.id,
        type: 'daily_login',
        referenceId: today, // Ensures only 1 login XP per day
        xp: 10
    })
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())

  // 1. Validar dados com Zod
  const validation = signupSchema.safeParse(data)

  if (!validation.success) {
    return { error: (validation.error as any).errors[0].message }
  }

  const { email, password, name, plan } = validation.data

  const supabase = await createClient()

  const { error, data: authData } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // GAMIFICATION: Log Daily Login (First login ever!)
  if (authData.user) {
    const today = new Date().toISOString().split('T')[0]
    await logActivity({
        userId: authData.user.id,
        type: 'daily_login',
        referenceId: today,
        xp: 10
    })
  }

  // Se um plano foi selecionado, criar sessão do Stripe
  if (plan && authData.user) {
    // TODO: Usar IDs reais do Stripe em produção
    const priceMap: Record<string, string> = {
        'basic': 'price_basic_placeholder', 
        'plus': 'price_plus_placeholder',
        'vip': 'price_vip_placeholder'
    }

    const priceId = priceMap[plan.toLowerCase()]

    if (priceId) {
      try {
          const { url } = await createCheckoutSession({
            priceId,
            userId: authData.user.id,
            userEmail: email,
            planName: plan
          });
          
          if (url) {
            redirect(url)
          }
      } catch (e) {
          console.error("Failed to create Stripe session during signup", e)
          // Em caso de erro no Stripe, continuamos para o dashboard
          // O usuário poderá assinar depois
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
