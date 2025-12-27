import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/services/stripe';

export async function POST(req: NextRequest) {
  try {
    const { priceId, planName } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { sessionId, url } = await createCheckoutSession({
      priceId,
      userId: user.id,
      userEmail: user.email,
      planName,
    });

    return NextResponse.json({ sessionId, url });
  } catch (error: any) {
    console.error('Stripe Checkout API Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
