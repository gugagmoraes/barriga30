export const dynamic = 'force-dynamic'

export default function CheckoutPage({ params }: { params: { plan: string } }) {
  console.log(`[DEBUG] Acessando CheckoutPage para o plano: ${params.plan}`)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-2xl font-bold">Checkout OK</h1>
      <p className="mt-2 text-gray-600">Processando Plano: {params.plan}</p>
      <p className="mt-4 text-sm text-gray-500">
        Se você está vendo esta tela, a rota existe e o 404 foi resolvido.
      </p>
      <a
        href="/#plans"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-white"
      >
        Voltar
      </a>
    </div>
  )
}
