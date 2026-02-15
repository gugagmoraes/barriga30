import { getUpgradeDetails } from '@/app/actions/upgrade'
import { UpgradeCard } from './upgrade-card'
import { redirect } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function UpgradePage() {
  const details = await getUpgradeDetails()

  if (!details) {
    redirect('/login')
  }

  const { currentPlan, currentPrice, options } = details

  if (options.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Parabéns!</h1>
        <p className="text-muted-foreground max-w-md">
          Você já está no nosso melhor plano. Aproveite todos os benefícios exclusivos do <strong>Plano Premium</strong>!
        </p>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Upgrade de Plano</h1>
        <p className="text-muted-foreground text-lg">
          Escolha o plano ideal para acelerar seus resultados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {options.map((option) => (
          <UpgradeCard 
            key={option.key} 
            option={option} 
            currentPlan={currentPlan} 
            currentPrice={currentPrice} 
          />
        ))}
      </div>
    </div>
  )
}
