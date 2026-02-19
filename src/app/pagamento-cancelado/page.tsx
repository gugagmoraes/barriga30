import Link from 'next/link'

export default async function PagamentoCanceladoPage() {
  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Pagamento cancelado</h1>
      <p className="text-gray-600">
        Nenhuma cobrança foi realizada.
      </p>
      <div className="flex items-center justify-center gap-3">
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