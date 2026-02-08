import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export default function UpgradePage() {
  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
        <Lock className="w-7 h-7 text-gray-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Desbloqueie mais flexibilidade</h1>
      <p className="text-gray-600">
        A opção de fazer uma versão mais leve do treino está disponível nos planos Plus e VIP.
        Faça upgrade para ter acesso a variações e treinos de todos os níveis.
      </p>
      <Link href="/checkout/plus">
        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 font-bold">
          Fazer Upgrade
        </Button>
      </Link>
      <div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 underline">
          Voltar para o dashboard
        </Link>
      </div>
    </div>
  )
}
