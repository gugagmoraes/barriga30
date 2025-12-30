'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { QuizButton } from '@/components/quiz/QuizButton'

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

  // Recommended weight range logic (mock calculation based on current weight or fixed range logic)
  // For now, using a placeholder range or simple calculation
  const recommendedMin = state.weight ? (state.weight * 0.85).toFixed(0) : 54
  const recommendedMax = state.weight ? (state.weight * 0.95).toFixed(0) : 67

  return (
    <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
      <div className="space-y-8 max-w-md mx-auto w-full px-4">
        
        <h1 className="text-xl font-medium text-left text-[#1F2937]">
          Qual é o <span className="font-bold">peso ideal</span> que você deseja atingir?
        </h1>

        <div className="relative">
          <input
            type="tel"
            value={target}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full p-4 pr-12 rounded-xl text-lg font-medium text-gray-900 border border-[#1E6B7B] focus:outline-none focus:ring-1 focus:ring-[#1E6B7B] text-center"
            autoFocus
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">kg</span>
        </div>

        <div className="text-center space-y-1">
          <p className="font-bold text-[#1F2937]">Faixa de peso recomendada:</p>
          <p className="text-[#1F2937]">{recommendedMin} kg - {recommendedMax} kg</p>
        </div>

        <div className="pt-4">
          <QuizButton
            onClick={handleNext}
            disabled={!target || parseFloat(target) < 30 || parseFloat(target) > 300}
            className="bg-[#A0A0A0] hover:bg-[#8f8f8f] disabled:bg-gray-300 shadow-none text-white font-medium py-3"
          >
            Próximo
          </QuizButton>
        </div>

        <div className="bg-[#F2F0EA] p-4 rounded-lg mt-6">
          <p className="text-gray-500 text-xs leading-relaxed text-justify">
            Usando dados de usuários reais do Barriga 30, vamos prever quando você atingirá seu peso ideal se seguir seu plano personalizado e adotar um estilo de vida saudável. Os resultados desta pesquisa não são garantidos e os usuários do Barriga 30 geralmente perdem de 1 a 3 kg por semana.
          </p>
        </div>
      </div>
    </div>
  )
}
