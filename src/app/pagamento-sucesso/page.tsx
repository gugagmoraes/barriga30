import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { attachCheckoutSessionToUser } from '@/lib/stripe/attach'

export default async function PagamentoSucessoPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string; session_id?: string }>
}) {
  const resolved = searchParams ? await searchParams : undefined
  const plan = resolved?.plan
  const sessionId = resolved?.session_id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && sessionId) {
    try {
      await attachCheckoutSessionToUser({
        checkoutSessionId: sessionId,
        userId: user.id,
        userEmail: user.email,
      })
    } catch {}
    redirect('/dashboard?checkout=success')
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Pagamento confirmado</h1>
      <p className="text-gray-600">
        {plan ? `Plano selecionado: ${plan}. ` : ''}
        Para acessar o conteúdo, crie sua conta (ou faça login) usando o mesmo e-mail utilizado no pagamento.
      </p>
      <div className="flex items-center justify-center gap-3">
        {sessionId ? (
          <Link
            href={`/register?checkout_session_id=${encodeURIComponent(sessionId)}`}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-white font-bold"
          >
            Criar conta e acessar
          </Link>
        ) : null}
        <Link
          href={sessionId ? `/login?checkout_session_id=${encodeURIComponent(sessionId)}` : '/login'}
          className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-6 py-3 text-gray-900 font-bold"
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  )
}
