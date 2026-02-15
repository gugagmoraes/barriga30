'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/schemas/auth'
import { logActivity } from '@/services/gamification'
import { saveQuizSubmission } from '../actions/quiz'
import { PlanType } from '@/types/database.types'
import { attachCheckoutSessionToUser } from '@/lib/stripe/attach'

export async function login(prevState: any, formData: FormData) {
  console.log('[Login Action] Started')
  console.log('Supabase URL defined:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  const data = Object.fromEntries(formData.entries())
  
  // 1. Validar dados com Zod
  const validation = loginSchema.safeParse(data)
  
  if (!validation.success) {
    return { error: (validation.error as any).errors[0].message }
  }

  const { email, password } = validation.data
  const checkoutSessionId = formData.get('checkout_session_id') as string | null

  const supabase = await createClient()

  try {
    const { error, data: authData } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase Auth Error:', error)
      return { error: error.message }
    }

    if (checkoutSessionId && authData.user) {
      const result = await attachCheckoutSessionToUser({
        checkoutSessionId,
        userId: authData.user.id,
        userEmail: authData.user.email ?? email,
      })
      console.log('[Login Action] Checkout attached:', result.plan)
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
  } catch (e: any) {
    if (e.message === 'NEXT_REDIRECT') throw e
    console.error('Login Exception:', e)
    return { error: 'Erro de conexão: Verifique se o Supabase está configurado corretamente.' }
  }
}

export async function signup(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const quizDataRaw = formData.get('quiz_data') as string
  const checkoutSessionId = formData.get('checkout_session_id') as string | null

  // 1. Validar dados com Zod
  const validation = signupSchema.safeParse(data)

  if (!validation.success) {
    return { error: (validation.error as any).errors[0].message }
  }

  const { email, password, name } = validation.data
  const planType: PlanType = 'basic'

  const supabase = await createClient()

  const { error, data: authData } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        plan_type: planType,
      },
    },
  })

  if (error) {
    console.error('Signup Error (Supabase Auth):', error)
    return { error: error.message }
  }

  // Ensure public.users has the plan_type (Critical for Diet Generation limits)
  if (authData.user) {
    // Explicitly Log User ID for debugging
    console.log('User created in Auth:', authData.user.id)
    
    // Attempt manual INSERT if trigger fails (Fallback)
    const { error: insertError } = await supabase.from('users').upsert({
        id: authData.user.id,
        email: email,
        name: name,
        plan_type: planType,
    })

    if (insertError) {
        console.error('CRITICAL: Failed to insert public.user manually:', insertError)
        // We continue, but this is bad.
    } else {
        console.log('Manual upsert to public.users successful')
    }
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

  if (checkoutSessionId && authData.user) {
    try {
      const result = await attachCheckoutSessionToUser({
        checkoutSessionId,
        userId: authData.user.id,
        userEmail: authData.user.email ?? email,
      })
      console.log('[Signup] Checkout attached:', result.plan)
    } catch (e: any) {
      console.error('[Signup] Failed to attach checkout session (non-blocking):', e)
      // We don't return error here to avoid blocking the user from accessing the dashboard.
      // The webhook should handle the plan update if this fails.
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
