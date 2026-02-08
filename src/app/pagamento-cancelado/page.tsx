import Link from 'next/link'

export default async function PagamentoCanceladoPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>
}) {
  const resolved = searchParams ? await searchParams : undefined
  const plan = resolved?.plan

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Pagamento cancelado</h1>
      <p className="text-gray-600">
        Nenhuma cobrança foi realizada. {plan ? `Você tentou assinar: ${plan}.` : ''}
      </p>
      <div className="flex items-center justify-center gap-3">
        {plan && (
          <Link
            href={`/checkout/${plan}`}
            className="inline-flex items-center justify-center rounded-lg bg-[#FF4D4D] px-6 py-3 text-white font-bold"
          >
            Tentar novamente
          </Link>
        )}
        <Link
          href="/#plans"
          className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-6 py-3 text-gray-900 font-bold"
        >
          Ver planos
        </Link>
      </div>
    </div>
  )
}

