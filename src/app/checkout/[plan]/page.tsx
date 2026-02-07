import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/services/stripe'

export const dynamic = 'force-dynamic'

const PRICE_IDS = {
  basic: 'price_1SjR0fGigUIifkMigDDhf5pv',
  plus: 'price_1SjR1vGigUIifkMib6IHcTak',
  vip: 'price_1SyI7SGigUIifkMizfRzNT4V',
} as const

type PlanKey = keyof typeof PRICE_IDS

function isPlanKey(value: string): value is PlanKey {
  return value === 'basic' || value === 'plus' || value === 'vip'
}

export default async function CheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = await params
  
  if (!isPlanKey(plan)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Plano Inválido</h1>
        <p>O plano selecionado não existe ({plan}). Por favor, volte e tente novamente.</p>
        <a href="/#plans" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Voltar para Planos
        </a>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://barriga30.vercel.app'
  
  // Configura URLs de sucesso/cancelamento
  const successUrl = process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL || `${origin}/pagamento-sucesso?plan=${plan}`
  const cancelUrl = process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL || `${origin}/pagamento-cancelado?plan=${plan}`

  let checkoutUrl: string | null = null

  try {
    const session = await createCheckoutSession({
        priceId: PRICE_IDS[plan],
        userId: user?.id || 'anonymous',
        userEmail: user?.email,
        planName: plan,
        successUrl,
        cancelUrl,
    })
    checkoutUrl = session.url
  } catch (error) {
    console.error('Checkout error:', error)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao iniciar pagamento</h1>
          <p>Ocorreu um erro ao conectar com o Stripe. Tente novamente mais tarde.</p>
          <a href="/#plans" className="mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Voltar
          </a>
        </div>
      )
  }

  if (checkoutUrl) {
      redirect(checkoutUrl)
  }

  // Fallback UI (só aparece se algo muito estranho acontecer e não redirecionar)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <h1 className="text-xl font-semibold">Processando pagamento...</h1>
    </div>
  )
}
