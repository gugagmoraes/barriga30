import Link from 'next/link'

export default async function PagamentoSucessoPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>
}) {
  const resolved = searchParams ? await searchParams : undefined
  const plan = resolved?.plan

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Pagamento confirmado</h1>
      <p className="text-gray-600">
        {plan ? `Plano selecionado: ${plan}. ` : ''}
        Estamos ativando seu acesso. Se o seu plano ainda não aparecer, aguarde alguns segundos e recarregue o dashboard.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-white font-bold"
        >
          Ir para o Dashboard
        </Link>
        <Link
          href="/dieta"
          className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-6 py-3 text-gray-900 font-bold"
        >
          Ver Minha Dieta
        </Link>
      </div>
    </div>
  )
}

