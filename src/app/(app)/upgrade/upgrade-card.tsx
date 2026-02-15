'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createUpgradeCheckout, UpgradeOption } from '@/app/actions/upgrade'
import { PlanKey } from '@/lib/stripe/prices'

const PLAN_COLORS: Record<PlanKey, string> = {
  basic: 'bg-blue-50 border-blue-200',
  plus: 'bg-purple-50 border-purple-200',
  vip: 'bg-amber-50 border-amber-200'
}

const PLAN_LABELS: Record<PlanKey, string> = {
  basic: 'Plano Essencial',
  plus: 'Plano Evolução',
  vip: 'Plano Premium'
}

interface UpgradeCardProps {
  option: UpgradeOption
  currentPlan: PlanKey
  currentPrice: number
}

export function UpgradeCard({ option, currentPlan, currentPrice }: UpgradeCardProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setLoading(true)
      await createUpgradeCheckout(option.key)
    } catch (error) {
      console.error('Upgrade failed', error)
      setLoading(false)
      alert('Erro ao iniciar o upgrade. Tente novamente.')
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100)
  }

  const isPremium = option.key === 'vip'
  const installment12 = option.diff / 12
  const installment12Annual = option.price / 12
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
          Upgrade do {PLAN_LABELS[currentPlan]}
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
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Valor Anual do {option.name}:</span>
            <span>{formatCurrency(option.price)}</span>
          </div>
          <div className="flex justify-end text-xs text-muted-foreground -mt-2">
            ou 12x de {formatCurrency(installment12Annual)} (sem juros)
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Seu Crédito ({PLAN_LABELS[currentPlan]}):</span>
            <span className="text-green-600 font-medium">-{formatCurrency(currentPrice)}</span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Valor a Pagar AGORA para Upgrade:</span>
              <span className="text-xl font-bold text-red-600">{formatCurrency(option.diff)}</span>
            </div>

            <div className="bg-white rounded-lg border border-red-100 p-3 text-center">
              <div className="text-xs text-muted-foreground">Ou em</div>
              <div className="text-red-600 font-extrabold text-3xl leading-none">
                12x de {formatCurrency(installment12)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">(sem juros)</div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Ou à vista por <span className="font-semibold text-gray-900">{formatCurrency(option.diff)}</span> (no cartão)
            </div>
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
          className={`w-full ${isPremium ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`} 
          size="lg" 
          onClick={handleUpgrade}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            `Fazer Upgrade para ${option.name}`
          )}
        </Button>
      </CardFooter>
      <div className="px-6 pb-4 text-[10px] text-muted-foreground text-center">
        Parcelamento em até 12x sem juros.
      </div>
    </Card>
  )
}
