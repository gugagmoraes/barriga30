import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/services/stripe';
import { stripe } from '@/lib/stripe/config'
import { getAppUrlFromEnvOrRequestOrigin, getPriceIdForPlan, isPlanKey, type PlanKey } from '@/lib/stripe/prices'

function getRequestOrigin(req: NextRequest) {
  const url = new URL(req.url);
  return url.origin;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = isPlanKey(body?.plan) ? (body.plan as PlanKey) : null;
    const planName = typeof body?.planName === 'string' ? body.planName : (plan || '');

    const priceIdFromBody = typeof body?.priceId === 'string' ? body.priceId : null;
    const priceId = plan ? getPriceIdForPlan(plan) : priceIdFromBody;

    if (!priceId) {
      return new NextResponse('Missing plan/priceId', { status: 400 });
    }

    const origin = getAppUrlFromEnvOrRequestOrigin(getRequestOrigin(req));

    const successUrl = process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL
      ? process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL
      : `${origin}/pagamento-sucesso${plan ? `?plan=${plan}` : ''}`;

    const cancelUrl = process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL
      ? process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL
      : `${origin}/pagamento-cancelado${plan ? `?plan=${plan}` : ''}`;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: profile } = await supabase.from('users').select('stripe_customer_id').eq('id', user.id).single()
    let customerId = profile?.stripe_customer_id as string | null | undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const { sessionId, url } = await createCheckoutSession({
      priceId,
      userId: user.id,
      userEmail: user.email ?? undefined,
      planName,
      successUrl,
      cancelUrl,
      customerId: customerId ?? undefined,
    });

    return NextResponse.json({ sessionId, url });
  } catch (error: any) {
    console.error('Stripe Checkout API Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
