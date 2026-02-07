import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/services/stripe'

const PRICE_IDS = {
  basic: 'price_1SjR0fGigUIifkMigDDhf5pv',
  plus: 'price_1SjR1vGigUIifkMib6IHcTak',
  vip: 'price_1SyI7SGigUIifkMizfRzNT4V',
} as const

type PlanKey = keyof typeof PRICE_IDS

function isPlanKey(value: string): value is PlanKey {
  return value === 'basic' || value === 'plus' || value === 'vip'
}

function getRequestOrigin(req: NextRequest) {
  const url = new URL(req.url)
  return url.origin
}

export async function GET(req: NextRequest, context: { params: Promise<{ plan: string }> }) {
  const params = await context.params
  const planRaw = params.plan

  if (!isPlanKey(planRaw)) {
    return new NextResponse('Invalid plan', { status: 400 })
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || getRequestOrigin(req)

  const successUrl = process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL
    ? process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL
    : `${origin}/pagamento-sucesso?plan=${planRaw}`

  const cancelUrl = process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL
    ? process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL
    : `${origin}/pagamento-cancelado?plan=${planRaw}`

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { url } = await createCheckoutSession({
    priceId: PRICE_IDS[planRaw],
    userId: user?.id || 'anonymous',
    userEmail: user?.email,
    planName: planRaw,
    successUrl,
    cancelUrl,
  })

  if (!url) {
    return new NextResponse('Checkout URL not created', { status: 500 })
  }

  return NextResponse.redirect(url)
}

