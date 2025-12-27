'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function WelcomePage() {
  const router = useRouter()

  const handleStart = () => {
    router.push('/quiz/objective')
  }

  return (
    <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
      <div className="space-y-8 text-center">
        {/* Title */}
        <h1 className="text-2xl font-bold text-[#1F2937] leading-tight">
          Vamos montar seu plano de 30 dias focado em perder barriga, do seu jeito.
        </h1>

        {/* Description */}
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Em menos de 3 minutos eu entendo seu corpo, sua rotina e o que você SONHA mudar.
          </p>
          <p>
            No final, você vê um plano que parece que foi feito por um personal e um nutricionista só pra você – só que sem gastar com academia nem consulta cara.
          </p>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-full text-white font-bold text-lg tracking-wide shadow-lg bg-[#FF6B6B] hover:bg-[#ff5252] transform transition-all duration-200 active:scale-95"
          >
            Começar meu plano
          </button>
        </div>
      </div>
    </div>
  )
}
