'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const OPTIONS = [
  { id: 'junk_daily', label: 'Como muita besteira quase todo dia (refri, doce, fast food…)' },
  { id: 'junk_sometimes', label: 'Como besteira algumas vezes na semana, mas também como comida normal (arroz, feijão, carne, salada)' },
  { id: 'try_healthy', label: 'Tento comer certo, mas me perco na correria / belisco muito' },
  { id: 'healthy', label: 'Já como relativamente bem, só preciso organizar melhor quantidade e horários' }
]

export default function DietHabitsPage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showMicroText, setShowMicroText] = useState(false)

  useEffect(() => {
    setCurrentStep(7)
  }, [setCurrentStep])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    updateState({ dietHabits: id })
    setShowMicroText(true)
  }

  const handleNext = () => {
    if (selectedId) {
      router.push('/quiz/food-prefs')
    }
  }

  const getMicroText = () => {
    if (!selectedId) return null
    
    if (selectedId === 'junk_daily' || selectedId === 'try_healthy') {
      return (
        <div className="space-y-2">
          <p className="font-bold">Tá tudo bem, você não é caso perdido.</p>
          <p>A ideia aqui é limpar sua alimentação sem tortura, usando comida de verdade que você gosta.</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <p className="font-bold">Ótimo, você já tem uma base boa.</p>
        <p>Agora vamos transformar isso em resultado visível de barriga, organizando melhor as quantidades pra sua meta.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
          Como você descreveria sua alimentação hoje?
        </h1>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`
                w-full py-4 px-6 rounded-2xl text-base font-medium transition-all duration-200 border-2
                flex items-center text-left
                ${selectedId === option.id 
                  ? 'bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-sm scale-[1.01]' 
                  : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Micro-text area */}
        <div className={`transition-all duration-500 overflow-hidden ${showMicroText ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900 text-sm leading-relaxed text-center">
            {getMicroText()}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            disabled={!selectedId}
            className={`
              w-full py-4 rounded-full text-white font-bold text-lg tracking-wide shadow-lg
              transform transition-all duration-200 active:scale-95
              ${selectedId
                ? 'bg-[#FF6B6B] hover:bg-[#ff5252] opacity-100 scale-100' 
                : 'bg-gray-300 cursor-not-allowed opacity-50 scale-100'}
            `}
          >
            PRÓXIMO
          </button>
        </div>
      </div>
    </div>
  )
}
