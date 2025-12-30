'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/schemas/auth'
import { createCheckoutSession } from '@/services/stripe'
import { logActivity } from '@/services/gamification'
import { saveQuizSubmission } from '../actions/quiz'
import { PlanType } from '@/types/database.types'

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
  const quizDataRaw = formData.get('quiz_data') as string

  // 1. Validar dados com Zod
  const validation = signupSchema.safeParse(data)

  if (!validation.success) {
    return { error: (validation.error as any).errors[0].message }
  }

  const { email, password, name, plan } = validation.data
  const planType = (plan ? plan.toLowerCase() : 'basic') as PlanType

  const supabase = await createClient()

  const { error, data: authData } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        plan_type: planType, // Stores in auth.users metadata
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Ensure public.users has the plan_type (Critical for Diet Generation limits)
  if (authData.user) {
    // We attempt to update. If the trigger hasn't run yet, this might fail or be weird,
    // but typically Supabase triggers are fast. 
    // If no trigger exists, we might need to INSERT. 
    // Safe bet: Upsert or Update. Let's assume the user row exists or will be created.
    // Actually, to be safe, let's wait for the trigger or do an upsert if we had all data.
    // For now, simple update.
    await supabase.from('users').update({ plan_type: planType }).eq('id', authData.user.id)
  }

  // 2. Handle Quiz Data Sync
  if (authData.user && quizDataRaw) {
    try {
      const quizState = JSON.parse(quizDataRaw)
      // Map QuizState to SaveQuizInput
      await saveQuizSubmission({
        status: 'completed',
        responses: quizState,
        version: 'v1.0',
        sessionId: `signup-${authData.user.id}-${Date.now()}`
      })
      console.log('Quiz synced during signup for user:', authData.user.id)
    } catch (e) {
      console.error('Failed to sync quiz data during signup:', e)
    }
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
        'basic': 'price_1SjR0fGigUIifkMigDDhf5pv', 
        'plus': 'price_1SjR1vGigUIifkMib6IHcTak',
        'vip': 'price_1SjR2OGigUIifkMiqqrZeQUq'
    }

    const priceId = priceMap[plan.toLowerCase()]

    if (priceId) {
      // WARNING: This will fail if using placeholder IDs. Ensure valid Stripe Price IDs are used.
      if (priceId.includes('placeholder')) {
          console.warn('⚠️ WARNING: Using placeholder Stripe Price IDs. Checkout will fail. Please update src/app/(auth)/actions.ts with real Price IDs.');
      }

      try {
          console.log('Criando sessão de checkout para:', { priceId, email, plan })
          const { url } = await createCheckoutSession({
            priceId,
            userId: authData.user.id,
            userEmail: email,
            planName: plan
          });
          
          if (url) {
            console.log('Redirecionando para Stripe:', url)
            redirect(url)
          }
      } catch (e: any) {
          // Se for erro de redirecionamento do Next.js, deixa passar
          if (e.message === 'NEXT_REDIRECT') {
            throw e
          }
          console.error("Failed to create Stripe session during signup", e)
          // Em caso de erro no Stripe, continuamos para o dashboard
          // O usuário poderá assinar depois
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
