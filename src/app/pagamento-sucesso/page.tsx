import Link from 'next/link'

export default async function PagamentoSucessoPage() {
  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Pagamento confirmado</h1>
      <p className="text-gray-600">
        Para acessar o conteúdo, crie sua conta (ou faça login) usando o mesmo e-mail utilizado no pagamento.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-white font-bold"
        >
          Criar conta e acessar
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-6 py-3 text-gray-900 font-bold"
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  )
}