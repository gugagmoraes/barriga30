'use client'

import { Check } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Tipos simplificados
type PlanKey = 'basic' | 'plus' | 'vip'

interface UpgradeOption {
  key: PlanKey
  name: string
  price: number
  benefits: string[]
  link: string
  installmentText?: string
}

interface UpgradeCardProps {
  option: UpgradeOption
  currentPlan: PlanKey
}

const getDisplayPlanName = (key: PlanKey) => {
  const map: Record<PlanKey, string> = {
    basic: 'Plano Essencial',
    plus: 'Plano Evolução',
    vip: 'Plano Premium'
  }
  return map[key] || key
}

export function UpgradeCard({ option, currentPlan }: UpgradeCardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100)
  }

  const isPremium = option.key === 'vip'
  const extraHeading =
    option.key === 'plus'
      ? 'TUDO do Plano Essencial, MAIS:'
      : option.key === 'vip'
        ? 'TUDO do Plano Evolução, MAIS:'
        : null

  return (
    <Card className={`relative overflow-hidden border-2 ${isPremium ? 'border-amber-400 shadow-lg scale-105 z-10' : 'border-gray-200'}`}>
      {isPremium && (
        <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
          RECOMENDADO
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          {option.name}
        </CardTitle>
        <CardDescription>
          Upgrade do {getDisplayPlanName(currentPlan)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Benefícios Adicionais
          </h4>
          {extraHeading && (
            <div className="text-sm font-semibold text-gray-900">
              {extraHeading}
            </div>
          )}
          <ul className="space-y-2">
            {option.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className={`h-4 w-4 mt-0.5 ${isPremium ? 'text-amber-600' : 'text-primary'}`} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100">
          <div className="text-center space-y-1 py-1">
             <div className="text-sm text-gray-500 font-medium">
                Valor Anual:
             </div>
             <div className="text-red-500 font-bold text-2xl">
                {formatCurrency(option.price)}
             </div>
             {option.installmentText && (
               <div className="flex justify-center mt-2">
                 <p className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                   {option.installmentText}
                 </p>
               </div>
             )}
          </div>
        </div>

        {isPremium && (
          <div className="bg-amber-50 p-3 rounded border border-amber-200 text-amber-800 text-xs font-medium flex gap-2 items-center">
            <span>
              Ao escolher o Premium, você garante <strong>R$100 de desconto</strong> na renovação do próximo ano!
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          asChild
          className={`w-full ${isPremium ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`} 
          size="lg" 
        >
          <a href={option.link} target="_blank" rel="noopener noreferrer">
            {`Fazer Upgrade para ${option.name}`}
          </a>
        </Button>
      </CardFooter>
      <div className="px-6 pb-4 text-[10px] text-muted-foreground text-center">
        Você será redirecionado para a página de pagamento segura.
      </div>
    </Card>
  )
}