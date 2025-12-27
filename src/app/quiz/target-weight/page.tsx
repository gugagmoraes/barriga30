'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TargetWeightPage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  const [target, setTarget] = useState<string>('')

  useEffect(() => {
    // This is technically usually step 3 if biometrics is step 2
    setCurrentStep(3)
    if (state.targetWeight) {
      setTarget(state.targetWeight.toString())
    }
  }, [setCurrentStep, state.targetWeight])

  const handleNext = () => {
    if (target && parseFloat(target) > 0) {
      updateState({ targetWeight: parseFloat(target) })
      // Next block is Body Parts
      router.push('/quiz/body-parts')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*\.?\d{0,1}$/.test(value)) {
      setTarget(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && target && parseFloat(target) > 30) {
      handleNext()
    }
  }

  // Calculate weight difference if current weight is known
  const weightDiff = state.weight && target ? (state.weight - parseFloat(target)).toFixed(1) : null

  return (
    <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
      <div className="space-y-8">
        <p className="text-gray-500 text-sm leading-relaxed text-center max-w-xs mx-auto">
          Definir uma meta clara aumenta suas chances de sucesso em 42%.
        </p>

        <h1 className="text-2xl font-bold text-center text-[#1F2937]">
          Qual é o seu peso desejado?
        </h1>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-40">
            <input
              type="tel"
              value={target}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="00.0"
              maxLength={5}
              className="w-full text-center text-5xl font-bold text-[#2A9D8F] border-b-4 border-[#F3F4F6] focus:border-[#2A9D8F] focus:outline-none py-4 bg-transparent placeholder-gray-300 transition-colors"
              autoFocus
            />
            <span className="absolute right-0 bottom-6 text-gray-400 font-medium text-xl">kg</span>
          </div>

          {weightDiff && parseFloat(weightDiff) > 0 && (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              Vamos eliminar {weightDiff} kg juntos! 🔥
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            disabled={!target || parseFloat(target) < 30 || parseFloat(target) > 300}
            className={`
              w-full py-4 rounded-full text-white font-bold text-lg tracking-wide shadow-lg
              transform transition-all duration-200 active:scale-95
              ${target && parseFloat(target) >= 30 && parseFloat(target) <= 300
                ? 'bg-[#FF9F89] hover:bg-[#FF8A6F] opacity-100 scale-100' 
                : 'bg-gray-300 cursor-not-allowed opacity-50 scale-100'}
            `}
            style={{ backgroundColor: target && parseFloat(target) >= 30 ? '#FF9F89' : undefined }}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  )
}
