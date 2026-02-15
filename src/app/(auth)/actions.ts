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
  console.log('[Login Action] Started')
  console.log('Supabase URL defined:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  const data = Object.fromEntries(formData.entries())
  
  // 1. Validar dados com Zod
  const validation = loginSchema.safeParse(data)
  
  if (!validation.success) {
    return { error: (validation.error as any).errors[0].message }
  }

  const { email, password } = validation.data

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

  // 1. Validar dados com Zod
  const validation = signupSchema.safeParse(data)

  if (!validation.success) {
    return { error: (validation.error as any).errors[0].message }
  }

  const { email, password, name, plan } = validation.data
  const selectedPlan = (plan ? plan.toLowerCase() : 'basic') as PlanType
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

  // Se um plano foi selecionado, criar sessão do Stripe
  // Apenas redireciona se o plano for diferente de basic OU se quisermos cobrar o basic também (depende da regra de negócio)
  // Assumindo que basic é gratuito ou fluxo diferente. Se basic for pago, remova a condição !== 'basic'
  if (plan && plan !== 'basic' && authData.user) {
    console.log('[Signup] Plan selected, initiating checkout:', plan)
    
    // Obter Price ID correto do módulo de preços
    // Importante: Usar a função auxiliar para garantir consistência
    const { getPriceIdForPlan } = await import('@/lib/stripe/prices')
    const priceId = getPriceIdForPlan(plan as any)

    if (priceId) {
      try {
          console.log('[Signup] Creating checkout session:', { priceId, email, plan })
          
          // Criar cliente Stripe se necessário (já tratado no createCheckoutSession ou no webhook, mas bom garantir)
          // A função createCheckoutSession lida com a criação do customer se não passado, mas precisamos passar o ID do usuário
          
          const { url } = await createCheckoutSession({
            priceId,
            userId: authData.user.id,
            userEmail: email,
            planName: plan,
            // Success URL deve redirecionar para dashboard com flag de sucesso
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&plan=${plan}`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=canceled`
          });
          
          if (url) {
            console.log('[Signup] Redirecting to Stripe:', url)
            redirect(url)
          } else {
            console.error('[Signup] Stripe session created but no URL returned')
          }
      } catch (e: any) {
          // Se for erro de redirecionamento do Next.js, deixa passar
          if (e.message === 'NEXT_REDIRECT') {
            throw e
          }
          console.error("[Signup] Failed to create Stripe session:", e)
          // Em caso de erro crítico no pagamento, talvez devêssemos avisar o usuário?
          // Por enquanto, segue para dashboard (fallback), mas o ideal seria tratar.
      }
    } else {
        console.error('[Signup] No price ID found for plan:', plan)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
