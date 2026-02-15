import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe';
import { getPlanFromPriceId, isPlanKey, getWebhookSecret, type PlanKey } from '@/lib/stripe/prices'

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, getWebhookSecret());
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const admin = createAdminClient()
  if (!admin) return new NextResponse('Server misconfigured', { status: 500 })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string | null;
        const userId = session.metadata?.userId;
        const planName = session.metadata?.planName;
        const type = session.metadata?.type;

        // Handle One-Time Upgrade Payment
        if (type === 'upgrade' && userId && planName) {
             const plan = isPlanKey(planName) ? (planName as PlanKey) : null
             if (plan) {
                 await admin.from('users').update({
                     plan_type: plan,
                     // We don't update subscription ID here as this is a one-off payment
                     // But we might want to log it?
                 }).eq('id', userId)
                 console.log(`[Webhook] User ${userId} upgraded to ${plan} via one-time payment`)
             }
             break;
        }

        if (!userId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price'],
        })

        const priceId = subscription.items.data[0]?.price?.id
        const planFromPrice = priceId ? getPlanFromPriceId(priceId) : null

        const plan: PlanKey =
          (isPlanKey(planName) ? (planName as PlanKey) : null) ||
          planFromPrice ||
          'basic'

        if (subscription.status === 'active' || subscription.status === 'trialing') {
          const currentPeriodEnd = (subscription as any).current_period_end as number | undefined
          await admin.from('users').update({
            plan_type: plan,
            stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : null,
            stripe_subscription_id: subscription.id,
            stripe_subscription_status: subscription.status,
            stripe_current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
          }).eq('id', userId)
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;

        const customerId = typeof subscription.customer === 'string' ? subscription.customer : null
        if (!customerId) break

        const { data: user } = await admin.from('users').select('id').eq('stripe_customer_id', customerId).maybeSingle()
        if (!user?.id) break

        if (status === 'active' || status === 'trialing') {
          const currentPeriodEnd = (subscription as any).current_period_end as number | undefined
          await admin.from('users').update({
            stripe_subscription_id: subscription.id,
            stripe_subscription_status: status,
            stripe_current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
          }).eq('id', user.id)
          break
        }

        const currentPeriodEnd = (subscription as any).current_period_end as number | undefined
        await admin.from('users').update({
          plan_type: 'basic',
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: status,
          stripe_current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
        }).eq('id', user.id)
        break;
      }

      default:
        // console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return new NextResponse('Received', { status: 200 });
}
