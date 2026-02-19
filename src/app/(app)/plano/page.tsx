import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PLAN_LABELS: Record<string, string> = {
  basic: 'Plano Essencial',
  plus: 'Plano Evolução',
  vip: 'Plano Premium'
}

export default async function MyPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('plan_type, stripe_current_period_end, stripe_subscription_status')
    .eq('id', user.id)
    .single()

  const planType = profile?.plan_type || 'basic'
  const planName = PLAN_LABELS[planType] || 'Plano Desconhecido'
  const isActive = profile?.stripe_subscription_status === 'active' || profile?.stripe_subscription_status === 'trialing'

  // Simples lógica: se não for VIP, pode fazer upgrade
  const canUpgrade = planType !== 'vip'

  const renewalDate = profile?.stripe_current_period_end 
    ? new Date(profile.stripe_current_period_end).toLocaleDateString('pt-BR') 
    : 'N/A'

  return (
    <div className="container max-w-3xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Plano</h1>
        <p className="text-muted-foreground">Gerencie sua assinatura e plano atual.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{planName}</CardTitle>
              <CardDescription className="mt-1">
                Status: <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? 'bg-green-600' : ''}>
                  {isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </CardDescription>
            </div>
            {canUpgrade && (
              <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
                <Link href="/upgrade">
                  <Zap className="mr-2 h-4 w-4 fill-current" />
                  Fazer Upgrade
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Renovação</p>
              <p className="font-medium">{renewalDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ciclo</p>
              <p className="font-medium">Anual</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
             <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Seus Benefícios Atuais
             </h3>
             <ul className="text-sm space-y-1 text-muted-foreground ml-6 list-disc">
                {planType === 'basic' && (
                    <>
                        <li>1 Programa de Treino Fixo (ABC)</li>
                        <li>1 Dieta Personalizada (1x no início)</li>
                        <li>Trackers de Hidratação e Refeições</li>
                        <li>Gamificação Básica (XP, Níveis)</li>
                        <li>Central de Ajuda via Bot</li>
                        <li>Acesso de 1 ano à plataforma</li>
                    </>
                )}
                {planType === 'plus' && (
                    <>
                        <li>TUDO do Plano Essencial, MAIS:</li>
                        <li>Programas de Treino Progressivos (Iniciante ao Avançado)</li>
                        <li>Dietas Dinâmicas e Adaptativas (Evita estagnação)</li>
                        <li>Gamificação Completa (Conquistas, Badges)</li>
                        <li>Histórico Completo de Progresso</li>
                        <li>Suporte Inteligente Acelerado</li>
                        <li>Acesso de 1 ano à plataforma</li>
                    </>
                )}
                {planType === 'vip' && (
                    <>
                        <li>TUDO do Plano Evolução, MAIS:</li>
                        <li>Treinos Especiais para Dias Críticos (TPM, etc)</li>
                        <li>Biblioteca Exclusiva (Glúteos, Abdômen...)</li>
                        <li>Desconto de R$100 na Renovação</li>
                        <li>Acesso Antecipado a Novidades</li>
                        <li>Suporte Inteligente VIP</li>
                        <li>Acesso de 1 ano à plataforma</li>
                    </>
                )}
             </ul>
          </div>
        </CardContent>
        {canUpgrade && (
            <CardFooter className="bg-amber-50/50 border-t border-amber-100 flex flex-col items-start gap-2 p-4">
                <p className="text-sm text-amber-800 font-medium">
                    Quer mais resultados? Aproveite o desconto proporcional para subir de nível!
                </p>
                <Button variant="outline" size="sm" asChild className="text-amber-700 border-amber-200 hover:bg-amber-100">
                    <Link href="/upgrade">Ver opções de Upgrade</Link>
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  )
}