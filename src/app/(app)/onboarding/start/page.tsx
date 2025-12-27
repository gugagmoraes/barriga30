import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Rocket } from 'lucide-react'

export default function OnboardingStartPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Rocket className="h-10 w-10 text-primary" />
        </div>
        
        <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Bem-vindo ao Barriga 30!</h1>
            <p className="text-gray-500">
                Para personalizar sua jornada, precisamos calibrar seu nível com um treino rápido de avaliação.
            </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm text-orange-800">
            ⏱️ Duração: Apenas 2 minutos
        </div>

        <Link href="/treinos/1" className="block w-full">
            <Button size="lg" className="w-full text-lg h-14 animate-pulse">
                Começar Agora
            </Button>
        </Link>
        
        <p className="text-xs text-gray-400">
            Não se preocupe, você pode fazer no seu ritmo.
        </p>
      </div>
    </div>
  )
}
