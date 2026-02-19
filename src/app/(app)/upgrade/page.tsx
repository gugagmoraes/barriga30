import { createClient } from '@/lib/supabase/server'
import { UpgradeCard } from './upgrade-card'
import { redirect } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  const currentPlan = profile?.plan_type || 'basic'

  // Opções hardcoded com links do Cakto
  const allOptions = [
    {
      key: 'plus',
      name: 'Plano Evolução',
      price: 19700, // Valor cheio anual (visual apenas)
      installmentText: 'ou 12x de R$ 22,91',
      benefits: [
        'Programas de Treino Progressivos (Iniciante ao Avançado)',
        'Dietas Dinâmicas e Adaptativas (Evita estagnação)',
        'Gamificação Completa (Conquistas, Badges)',
        'Histórico Completo de Progresso',
        'Suporte Inteligente Acelerado',
        'Acesso de 1 ano à plataforma',
      ],
      link: 'https://pay.cakto.com.br/fyw6tut_775098'
    },
    {
      key: 'vip',
      name: 'Plano Premium',
      price: 29700, // Valor cheio anual (visual apenas)
      installmentText: 'ou 12x de R$ 34,53',
      benefits: [
        'Treinos Especiais para Dias Críticos (TPM, etc)',
        'Biblioteca Exclusiva (Glúteos, Abdômen...)',
        'Desconto de R$100 na Renovação',
        'Acesso Antecipado a Novidades',
        'Suporte Inteligente VIP',
        'Acesso de 1 ano à plataforma',
      ],
      link: 'https://pay.cakto.com.br/bkiq2wi_775098'
    }
  ]

  let options: any[] = []

  if (currentPlan === 'basic') {
    options = allOptions
  } else if (currentPlan === 'plus') {
    options = allOptions.filter(o => o.key === 'vip')
  }

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
          />
        ))}
      </div>
    </div>
  )
}