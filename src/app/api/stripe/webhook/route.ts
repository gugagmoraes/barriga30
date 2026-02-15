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
    console.log(`[Webhook] Processing event: ${event.type}`, { id: event.id })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string | null;
        let userId = session.metadata?.userId;
        const planName = session.metadata?.planName;
        const type = session.metadata?.type;

        console.log(`[Webhook] checkout.session.completed`, { 
            sessionId: session.id, 
            userId, 
            planName, 
            type, 
            subscriptionId 
        })

        // Handle One-Time Upgrade Payment
        if (type === 'upgrade' && userId && planName) {
             const plan = isPlanKey(planName) ? (planName as PlanKey) : null
             if (plan) {
                 console.log(`[Webhook] Upgrading user ${userId} to plan ${plan}...`)
                 const { error } = await admin.from('users').update({
                     plan_type: plan,
                 }).eq('id', userId)

                 if (error) {
                     console.error(`[Webhook] Failed to update user plan: ${error.message}`)
                 } else {
                     console.log(`[Webhook] Successfully upgraded user ${userId} to ${plan}`)
                 }
             } else {
                 console.warn(`[Webhook] Invalid plan name in metadata: ${planName}`)
             }
             break;
        }

        if (!userId || !subscriptionId) {
            // TENTATIVA DE RECUPERAÇÃO: Se não vier userId, busca pelo email do cliente no Stripe
            if (!userId && session.customer_details?.email) {
                console.log(`[Webhook] UserId missing. Trying to find user by email: ${session.customer_details.email}`)
                const { data: userByEmail } = await admin
                    .from('users')
                    .select('id')
                    .eq('email', session.customer_details.email)
                    .maybeSingle()
                
                if (userByEmail) {
                    userId = userByEmail.id
                    console.log(`[Webhook] User found by email: ${userId}`)
                } else {
                    console.log(`[Webhook] User not found by email: ${session.customer_details.email}`)
                }
            }
        }

        if (!userId || !subscriptionId) {
            console.log('[Webhook] Missing userId or subscriptionId (and email lookup failed), skipping.')
            break
        }

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
        const eventSubscription = event.data.object as Stripe.Subscription;
        
        console.log(`[Webhook] Subscription event: ${event.type}`, { subscriptionId: eventSubscription.id })

        // CORREÇÃO: Busca a assinatura completa para ter acesso aos preços expandidos
        // Isso garante que saibamos qual é o plano atual (Basic, Plus, VIP)
        const subscription = await stripe.subscriptions.retrieve(eventSubscription.id, {
          expand: ['items.data.price'],
        })

        const status = subscription.status;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : null
        
        if (!customerId) {
            console.log('[Webhook] Missing customerId in subscription')
            break
        }

        const { data: user } = await admin.from('users').select('id').eq('stripe_customer_id', customerId).maybeSingle()
        if (!user?.id) {
            console.error(`[Webhook] User not found for customerId: ${customerId}`)
            break
        }

        console.log(`[Webhook] Updating subscription for user ${user.id}`)

        // Determina o plano baseado no ID do preço
        const priceId = subscription.items.data[0]?.price?.id
        const planFromPrice = priceId ? getPlanFromPriceId(priceId) : null
        const plan: PlanKey = planFromPrice || 'basic'

        console.log(`[Webhook] Subscription plan determined: ${plan} (from price ${priceId})`)

        const currentPeriodEnd = (subscription as any).current_period_end as number | undefined

        if (status === 'active' || status === 'trialing') {
          const { error } = await admin.from('users').update({
            plan_type: plan, // Atualiza o plano corretamente
            stripe_subscription_id: subscription.id,
            stripe_subscription_status: status,
            stripe_current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
          }).eq('id', user.id)

          if (error) {
              console.error(`[Webhook] Failed to update user subscription: ${error.message}`)
          } else {
              console.log(`[Webhook] Successfully updated subscription for user ${user.id}`)
          }
        } else {
          // Se cancelado ou não pago, volta para o plano basic
          const { error } = await admin.from('users').update({
            plan_type: 'basic',
            stripe_subscription_id: subscription.id,
            stripe_subscription_status: status,
            stripe_current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
          }).eq('id', user.id)

          if (error) {
              console.error(`[Webhook] Failed to update user subscription (cancellation): ${error.message}`)
          } else {
              console.log(`[Webhook] Successfully updated subscription (cancellation) for user ${user.id}`)
          }
        }
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
