'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const OPTIONS = [
  { id: 'low', label: 'Queria só dar uma leve secada, nada muito radical.' },
  { id: 'medium', label: 'Ela me incomoda nas roupas e nas fotos, mas nunca pensei muito na parte da saúde.' },
  { id: 'high_health', label: 'Eu já sei que essa barriga faz mal pra minha saúde e isso me preocupa.' },
  { id: 'high_failed', label: 'Eu já pesquisei mil coisas sobre barriga, dieta, treino… meu problema é conseguir manter.' }
]

export default function ConsciousnessPage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showMicroText, setShowMicroText] = useState(false)

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    updateState({ consciousnessLevel: id })
    setShowMicroText(true)
  }

  const handleNext = () => {
    if (selectedId) {
      router.push('/quiz/medical')
    }
  }

  const getMicroText = () => {
    if (!selectedId) return null
    
    if (selectedId === 'low' || selectedId === 'medium') {
      return (
        <div className="space-y-3 text-left">
          <p>A gordura que fica na barriga não é só estética.</p>
          <p>Ela é a que mais se liga a diabetes, pressão alta e problemas de coração.</p>
          <p>Cuidar da barriga agora é cuidar da sua presença pros seus filhos, netos, relação, trabalho, tudo.</p>
          <p>E não precisa virar rata de academia nem passar fome.</p>
          <p className="font-bold">Vamos montar algo possível pra sua vida real.</p>
        </div>
      )
    }

    return (
      <div className="space-y-3 text-left">
        <p>Você já sabe que essa barriga não é só estética.</p>
        <p className="font-bold">Agora a missão é montar um plano que caiba na sua rotina de verdade.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
          Quando você pensa na SUA barriga hoje, qual frase mais parece com você?
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
        <div className={`transition-all duration-500 overflow-hidden ${showMicroText ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-900 text-sm leading-relaxed shadow-sm">
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
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
