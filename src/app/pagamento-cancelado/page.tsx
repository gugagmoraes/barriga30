'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PagamentoCanceladoPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">Pagamento cancelado</h1>
        <p className="text-gray-600 mb-8">
          Sem problemas. Você pode tentar novamente quando quiser.
        </p>
        <Link href="/#plans" className="block">
          <Button className="w-full h-12 text-base font-bold bg-[#FF4D4D] hover:bg-[#e63e3e] text-white">
            Voltar para os planos
          </Button>
        </Link>
        <div className="mt-4">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-800">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}

