import { stripe } from '@/lib/stripe/config';

interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  userEmail?: string;
  planName?: string;
  successUrl?: string;
  cancelUrl?: string;
  customerId?: string;
}

export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  planName,
  successUrl,
  cancelUrl,
  customerId,
}: CreateCheckoutSessionParams) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      ...(customerId ? { customer: customerId } : { customer_email: userEmail }),
      metadata: {
        userId,
        planName: planName || '',
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
}
