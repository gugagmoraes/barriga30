'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const OPTIONS = [
  { id: 'belly', label: 'Barriga / "pochete"' },
  { id: 'thighs', label: 'Coxas / culote' },
  { id: 'arms', label: 'Braços' },
  { id: 'back', label: 'Costas / gordurinha do sutiã' },
  { id: 'flab', label: 'Flacidez geral' },
  { id: 'other', label: 'Outro' }
]

export default function BodyPartsPage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const handleSelect = (id: string) => {
    let updated = [...selectedIds]
    if (updated.includes(id)) {
      updated = updated.filter(i => i !== id)
    } else {
      updated = [...updated, id]
    }
    setSelectedIds(updated)
    updateState({ bodyParts: updated })
  }

  const handleNext = () => {
    // If user clicked next, check if belly is selected
    if (!selectedIds.includes('belly')) {
      setShowWarning(true)
    } else {
      router.push('/quiz/consciousness')
    }
  }

  const handleConfirmWarning = () => {
    router.push('/quiz/consciousness')
  }

  if (showWarning) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-6 text-center">
          <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
            <h2 className="text-xl font-bold text-yellow-800 mb-4">
              Aviso importante
            </h2>
            <p className="text-yellow-900 leading-relaxed mb-4">
              Mesmo que outras partes também incomodem, a gordura da barriga é a que mais mexe com saúde (diabetes, pressão, coração).
            </p>
            <p className="text-yellow-900 leading-relaxed font-medium">
              Nesse plano de 30 dias vamos focar primeiro nela, combinado?
            </p>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleConfirmWarning}
              className="w-full py-4 rounded-full text-white font-bold text-lg tracking-wide shadow-lg bg-[#FF6B6B] hover:bg-[#ff5252] transform transition-all duration-200 active:scale-95"
            >
              Combinado, pode seguir
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
          O que mais te incomoda hoje no seu corpo?
        </h1>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((option) => {
            const isSelected = selectedIds.includes(option.id)
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`
                  w-full py-4 px-6 rounded-2xl text-lg font-medium transition-all duration-200 border-2
                  flex items-center justify-between
                  ${isSelected
                    ? 'bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-sm scale-[1.01]' 
                    : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'}
                `}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            disabled={selectedIds.length === 0}
            className={`
              w-full py-4 rounded-full text-white font-bold text-lg tracking-wide shadow-lg
              transform transition-all duration-200 active:scale-95
              ${selectedIds.length > 0
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
