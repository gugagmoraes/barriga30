import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) throw new Error('Stripe webhook secret not set');
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // Retrieve the subscription details from Stripe.
        const subscriptionId = session.subscription as string;
        const userId = session.metadata?.userId;
        const planName = session.metadata?.planName;

        if (userId && subscriptionId) {
           // Update user's subscription in Supabase
           // 1. Find the plan ID based on planName or price ID? 
           // For MVP let's assume we store the plan in metadata or lookup by price.
           // Ideally we query the 'plans' table.
           
           // We need to fetch the plan_id from the 'plans' table based on the price ID or name
           // But here we might not have easy access to price ID in session object directly without expansion?
           // Session has line_items if expanded, or we can use the planName passed in metadata.
           
           let planId;
           if (planName) {
               const { data: plan } = await supabase.from('plans').select('id').ilike('name', planName).single();
               planId = plan?.id;
           }

           // Insert into subscriptions table
           if (planId) {
               await supabase.from('subscriptions').insert({
                   user_id: userId,
                   plan_id: planId,
                   stripe_subscription_id: subscriptionId,
                   status: 'active',
                   current_period_start: new Date().toISOString(), // Approximation, real dates come from subscription object
                   current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
               });

               // Also update users table status/level if needed
               // e.g. set level based on plan? Or just unlock features.
           }
        }
        break;
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        
        await supabase.from('subscriptions')
            .update({ status: status })
            .eq('stripe_subscription_id', subscription.id);
        break;

      default:
        // console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return new NextResponse('Received', { status: 200 });
}
