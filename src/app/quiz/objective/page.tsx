'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { QuizOption } from '@/components/quiz/QuizOption'
import { QuizButton } from '@/components/quiz/QuizButton'

const OPTIONS = [
  { id: 'lose_10', label: 'Perder até 10 kg' },
  { id: 'lose_11_20', label: 'Perder entre 11 e 20 kg' },
  { id: 'lose_20_plus', label: 'Perder mais de 20 kg' },
  { id: 'maintain', label: 'Manter o peso que eu já tenho' },
  { id: 'undecided', label: 'Ainda não me decidi, só quero começar a cuidar de mim' }
]

export default function ObjectivePage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  const [showMicroText, setShowMicroText] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    updateState({ objective: id })
    // Avança automaticamente para a próxima página
    router.push('/quiz/biometrics')
  }

  // Removemos o botão de "Próximo" pois agora é automático
  /* 
  const handleNext = () => {
    if (selectedId) {
      router.push('/quiz/biometrics')
    }
  }
  */

  const getMicroText = () => {
    if (!selectedId) return null
    if (['lose_10', 'lose_11_20', 'lose_20_plus'].includes(selectedId)) {
      return "Perfeito. Vamos focar primeiro em secar barriga e desinchar, dentro do que é saudável pra você."
    }
    if (selectedId === 'maintain') {
      return "Maravilha. Seu plano vai ser pra manter o que já conquistou e definir mais a barriga."
    }
    if (selectedId === 'undecided') {
      return "Tudo bem. Vamos começar com 30 dias pra você ver resultado de verdade e decidir com calma."
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
          Qual é seu maior objetivo com o peso hoje?
        </h1>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((option) => (
            <QuizOption
              key={option.id}
              label={option.label}
              selected={selectedId === option.id}
              onClick={() => handleSelect(option.id)}
            />
          ))}
        </div>

        {/* Micro-text area removed since we auto-advance */}
        {/*
        <div className={`transition-all duration-500 overflow-hidden ${showMicroText ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm font-medium text-center">
            {getMicroText()}
          </div>
        </div>
        */}
      </div>

      {/* Footer removed since we auto-advance */}
      {/*
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <QuizButton
            onClick={handleNext}
            disabled={!selectedId}
          >
            PRÓXIMO
          </QuizButton>
        </div>
      </div>
      */}
    </div>
  )
}
