import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/services/stripe';

const PRICE_IDS = {
  basic: 'price_1SjR0fGigUIifkMigDDhf5pv',
  plus: 'price_1SjR1vGigUIifkMib6IHcTak',
  vip: 'price_1SyI7SGigUIifkMizfRzNT4V',
} as const;

type PlanKey = keyof typeof PRICE_IDS;

function isPlanKey(value: unknown): value is PlanKey {
  return value === 'basic' || value === 'plus' || value === 'vip';
}

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
    const priceId = plan ? PRICE_IDS[plan] : priceIdFromBody;

    if (!priceId) {
      return new NextResponse('Missing plan/priceId', { status: 400 });
    }

    const allowedPriceIds = new Set(Object.values(PRICE_IDS));
    if (!allowedPriceIds.has(priceId)) {
      return new NextResponse('Invalid priceId', { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || getRequestOrigin(req);

    const successUrl = process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL
      ? process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL
      : `${origin}/pagamento-sucesso${plan ? `?plan=${plan}` : ''}`;

    const cancelUrl = process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL
      ? process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL
      : `${origin}/pagamento-cancelado${plan ? `?plan=${plan}` : ''}`;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { sessionId, url } = await createCheckoutSession({
      priceId,
      userId: user?.id || 'anonymous',
      userEmail: user?.email,
      planName,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({ sessionId, url });
  } catch (error: any) {
    console.error('Stripe Checkout API Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
