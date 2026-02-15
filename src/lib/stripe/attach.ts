import { stripe } from '@/lib/stripe/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanFromPriceId, isPlanKey, type PlanKey } from '@/lib/stripe/prices'

export async function attachCheckoutSessionToUser(params: {
  checkoutSessionId: string
  userId: string
  userEmail?: string | null
}): Promise<{ plan: PlanKey }> {
  const admin = createAdminClient()
  if (!admin) throw new Error('Server misconfigured')

  const session = await stripe.checkout.sessions.retrieve(params.checkoutSessionId)

  const sessionEmail =
    (session.customer_details?.email as string | null | undefined) ??
    (session.customer_email as string | null | undefined) ??
    null

  if (params.userEmail && sessionEmail) {
    if (params.userEmail.trim().toLowerCase() !== sessionEmail.trim().toLowerCase()) {
      console.warn(`[Attach] Email mismatch warning: Session email (${sessionEmail}) vs User email (${params.userEmail}). Proceeding anyway.`)
      // throw new Error('Email mismatch') -- REMOVED STRICT CHECK
    }
  }

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription as any)?.id

  if (!subscriptionId) throw new Error('Missing subscription')

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  })

  const priceId = subscription.items.data[0]?.price?.id
  const planFromPrice = priceId ? getPlanFromPriceId(priceId) : null
  const planFromMeta = isPlanKey(session.metadata?.planName) ? (session.metadata?.planName as PlanKey) : null
  const plan: PlanKey = planFromMeta || planFromPrice || 'basic'

  const currentPeriodEnd = (subscription as any).current_period_end as number | undefined

  const customerId = typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id ?? null

  const { error } = await admin
    .from('users')
    .update({
      plan_type: plan,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_subscription_status: subscription.status,
      stripe_current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    })
    .eq('id', params.userId)

  if (error) throw new Error(error.message)

  return { plan }
}

