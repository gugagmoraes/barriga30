import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { getPlanFromPriceId, isPlanKey, type PlanKey } from '@/lib/stripe/prices'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const sessionId = url.searchParams.get('session_id')

  if (!sessionId) return new NextResponse('Missing session_id', { status: 400 })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const email =
      (session.customer_details?.email as string | null | undefined) ??
      (session.customer_email as string | null | undefined) ??
      null

    let plan: PlanKey | null = isPlanKey(session.metadata?.planName) ? (session.metadata?.planName as PlanKey) : null

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as any)?.id

    if (!plan && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] })
      const priceId = subscription.items.data[0]?.price?.id
      plan = priceId ? getPlanFromPriceId(priceId) : null
    }

    return NextResponse.json({ email, plan })
  } catch (e: any) {
    return new NextResponse(e?.message || 'Failed to retrieve session', { status: 500 })
  }
}

