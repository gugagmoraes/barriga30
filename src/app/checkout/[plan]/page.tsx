import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/services/stripe'
import { stripe } from '@/lib/stripe/config'
import { getPriceIdForPlan, isPlanKey } from '@/lib/stripe/prices'

export const dynamic = 'force-dynamic'

async function getRequestOrigin() {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (host) return `${proto}://${host}`
  return process.env.NEXT_PUBLIC_APP_URL ?? ''
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { plan: string } | Promise<{ plan: string }>
  searchParams?: { debug?: string } | Promise<{ debug?: string }>
}) {
  const resolvedParams = await Promise.resolve(params)
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : undefined

  const plan = resolvedParams?.plan
  const debug = resolvedSearchParams?.debug === '1'

  console.log(`[CHECKOUT] hit /checkout/${plan} debug=${debug}`)

  if (typeof plan !== 'string' || !isPlanKey(plan)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Plano inválido</h1>
        <p className="mt-2 text-gray-600">Plano recebido: {plan}</p>
        <a
          href="/#plans"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-white"
        >
          Voltar
        </a>
      </div>
    )
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || (await getRequestOrigin())
  const successUrl =
    process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL || `${origin}/pagamento-sucesso?plan=${plan}`
  const cancelUrl =
    process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL || `${origin}/pagamento-cancelado?plan=${plan}`

  if (debug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold">Checkout OK</h1>
        <p className="mt-2 text-gray-600">Rota OK: /checkout/{plan}</p>
        <p className="mt-1 text-xs text-gray-500">origin: {origin}</p>
        <p className="mt-1 text-xs text-gray-500">successUrl: {successUrl}</p>
        <p className="mt-1 text-xs text-gray-500">cancelUrl: {cancelUrl}</p>
        <a
          href={`/checkout/${plan}`}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#FF4D4D] px-6 py-3 text-white"
        >
          Continuar para pagamento
        </a>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/register?plan=${plan}`)
  }

  try {
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

    const { url } = await createCheckoutSession({
      priceId: getPriceIdForPlan(plan),
      userId: user.id,
      userEmail: user.email ?? undefined,
      planName: plan,
      successUrl,
      cancelUrl,
      customerId: customerId ?? undefined,
    })

    if (!url) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro ao iniciar pagamento</h1>
          <p className="mt-2 text-gray-600">Checkout URL não foi criada.</p>
          <a
            href={`/checkout/${plan}?debug=1`}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-white"
          >
            Abrir debug
          </a>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold">Quase lá!</h1>
        <p className="mt-2 text-gray-600">Clique abaixo para finalizar seu pagamento no Stripe.</p>
        <a
          href={url}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#FF4D4D] px-6 py-3 text-white font-bold text-lg hover:bg-[#e63e3e] transition-colors"
        >
          Pagar Agora
        </a>
      </div>
    )
  } catch (error) {
    console.error('[CHECKOUT] erro ao criar sessão', error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Erro ao iniciar pagamento</h1>
        <p className="mt-2 text-gray-600">Falha ao criar sessão no Stripe.</p>
        <a
          href={`/checkout/${plan}?debug=1`}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-white"
        >
          Abrir debug
        </a>
      </div>
    )
  }
}
