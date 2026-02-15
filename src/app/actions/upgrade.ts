'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/config'
import { STRIPE_PRICE_IDS, PlanKey } from '@/lib/stripe/prices'
import { redirect } from 'next/navigation'

export type UpgradeOption = {
  key: PlanKey
  name: string
  price: number // Annual price in cents
  diff: number // Difference to pay in cents
  benefits: string[]
}

type UpgradeDetails = {
  currentPlan: PlanKey
  currentPrice: number
  options: UpgradeOption[]
}

const PLAN_NAMES: Record<PlanKey, string> = {
  basic: 'Plano Essencial',
  plus: 'Plano Evolução',
  vip: 'Plano Premium'
}

const PLAN_BENEFITS_EXTRA: Record<Exclude<PlanKey, 'basic'>, string[]> = {
  plus: [
    'Programas de Treino Progressivos (Iniciante ao Avançado)',
    'Dietas Dinâmicas e Adaptativas (Evita estagnação)',
    'Gamificação Completa (Conquistas, Badges)',
    'Histórico Completo de Progresso',
    'Suporte Inteligente Acelerado',
    'Acesso de 1 ano à plataforma',
  ],
  vip: [
    'Treinos Especiais para Dias Críticos (TPM, etc)',
    'Biblioteca Exclusiva (Glúteos, Abdômen...)',
    'Desconto de R$100 na Renovação',
    'Acesso Antecipado a Novidades',
    'Suporte Inteligente VIP',
    'Acesso de 1 ano à plataforma',
  ],
}

export async function getUpgradeDetails(): Promise<UpgradeDetails | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase.from('users').select('plan_type').eq('id', user.id).single()
  const currentPlan = (userData?.plan_type as PlanKey) || 'basic'

  // Fetch prices from Stripe to be accurate
  // We assume price objects exist. If not, fallback to hardcoded or fail gracefully.
  let prices: any[] = []
  try {
      prices = await Promise.all([
        stripe.prices.retrieve(STRIPE_PRICE_IDS.basic),
        stripe.prices.retrieve(STRIPE_PRICE_IDS.plus),
        stripe.prices.retrieve(STRIPE_PRICE_IDS.vip)
      ])
  } catch (e) {
      console.error('Failed to fetch stripe prices', e)
      return null
  }

  const priceMap: Record<PlanKey, number> = {
    basic: prices[0].unit_amount || 0,
    plus: prices[1].unit_amount || 0,
    vip: prices[2].unit_amount || 0
  }

  const currentPrice = priceMap[currentPlan]
  const options: UpgradeOption[] = []

  // Define possible upgrades
  // Logic: Basic -> Plus, Basic -> VIP, Plus -> VIP
  if (currentPlan === 'basic') {
      const plusPrice = priceMap['plus']
      const vipPrice = priceMap['vip']
      
      options.push({
          key: 'plus',
          name: PLAN_NAMES['plus'],
          price: plusPrice,
          diff: Math.max(0, plusPrice - currentPrice),
          benefits: PLAN_BENEFITS_EXTRA['plus']
      })
      options.push({
          key: 'vip',
          name: PLAN_NAMES['vip'],
          price: vipPrice,
          diff: Math.max(0, vipPrice - currentPrice),
          benefits: PLAN_BENEFITS_EXTRA['vip']
      })
  } else if (currentPlan === 'plus') {
      const vipPrice = priceMap['vip']
      options.push({
          key: 'vip',
          name: PLAN_NAMES['vip'],
          price: vipPrice,
          diff: Math.max(0, vipPrice - currentPrice),
          benefits: PLAN_BENEFITS_EXTRA['vip']
      })
  }

  return {
    currentPlan,
    currentPrice,
    options
  }
}

export async function createUpgradeCheckout(targetPlan: PlanKey) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const details = await getUpgradeDetails()
    if (!details) throw new Error('Could not fetch details')

    const option = details.options.find(o => o.key === targetPlan)
    if (!option) throw new Error('Invalid upgrade option')

    const { data: profile } = await supabase.from('users').select('stripe_customer_id').eq('id', user.id).single()
    
    let customerId = profile?.stripe_customer_id
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email ?? undefined,
            metadata: { userId: user.id }
        })
        customerId = customer.id
        await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) throw new Error('Missing NEXT_PUBLIC_APP_URL')

    const session = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Upgrade para ${option.name}`,
              description: `Diferença de valor para upgrade do plano ${PLAN_NAMES[details.currentPlan]} para ${option.name}`
            },
            unit_amount: option.diff,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'upgrade',
        userId: user.id,
        targetPlan: targetPlan,
        planName: targetPlan
      },
      payment_method_options: {
          card: {
              installments: {
                  enabled: true
              }
          }
      },
      success_url: `${appUrl}/dashboard?upgrade=success`,
      cancel_url: `${appUrl}/upgrade?canceled=true`,
    })

    if (session.url) {
      redirect(session.url)
    }
  } catch (error) {
    console.error('Create Upgrade Checkout Error:', error)
    throw error // Re-throw to be caught by client component
  }
}
