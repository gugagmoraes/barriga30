'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const TIME_OPTIONS = [
  { id: '10_min', label: '10 minutos' },
  { id: '15_min', label: '15 minutos' },
  { id: '20_min', label: '20 minutos' },
  { id: '30_min', label: '30 minutos' },
  { id: '30_plus', label: 'Mais de 30 minutos' }
]

const FREQUENCY_OPTIONS = [
  { id: '2x', label: '2x por semana' },
  { id: '3x', label: '3x por semana' },
  { id: '4x', label: '4x por semana' },
  { id: '5x', label: '5x ou mais' }
]

export default function RoutinePage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  
  const [step, setStep] = useState(0) // 0 = Time, 1 = Frequency
  const [time, setTime] = useState<string | null>(null)
  const [frequency, setFrequency] = useState<string | null>(null)
  const [showMicroText, setShowMicroText] = useState(false)

  useEffect(() => {
    setCurrentStep(6)
  }, [setCurrentStep])

  const handleSelectTime = (id: string) => {
    setTime(id)
    updateState({ workoutTime: id })
  }

  const handleSelectFrequency = (id: string) => {
    setFrequency(id)
    updateState({ workoutFrequency: id })
    setShowMicroText(true)
  }

  const handleNext = () => {
    if (step === 0) {
      if (time) setStep(1)
    } else {
      if (frequency) router.push('/quiz/diet-habits')
    }
  }

  const getMicroText = () => {
    if (!time || !frequency) return null

    // Extract number from frequency ID (e.g. '3x' -> 3)
    const freqNum = frequency.replace('x', '')
    
    // Extract time label for display (e.g. '15_min' -> '15')
    const timeNum = time.replace('_min', '').replace('_plus', '+')

    return (
      <div className="space-y-3 text-left text-sm">
        <p className="font-bold text-base text-[#1F2937]">
          Perfeito! Seu plano começa com {freqNum}x por semana, mas tem evolução anual degrau por degrau:
        </p>
        
        <p className="text-gray-700">
          Iremos evoluir juntos ao longo dos meses, não só dos 30 dias. O desafio de 30 dias se renovará todos os meses, para você alcançar seus resultados solidamente e manter uma rotina de treino e dieta.
        </p>
      </div>
    )
  }

  // Step 0: Time
  if (step === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
            Na sua rotina real, quanto tempo você consegue separar pra treinar em casa?
          </h1>

          <div className="flex flex-col gap-3">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectTime(opt.id)}
                className={`
                  w-full py-4 px-6 rounded-2xl text-lg font-medium transition-all duration-200 border-2
                  flex items-center justify-center
                  ${time === opt.id 
                    ? 'bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-sm scale-[1.01]' 
                    : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleNext}
              disabled={!time}
              className={`
                w-full py-4 rounded-full text-white font-bold text-lg tracking-wide shadow-lg
                transform transition-all duration-200 active:scale-95
                ${time
                  ? 'bg-[#FF9F89] hover:bg-[#FF8A6F] opacity-100 scale-100 text-white' 
                  : 'bg-gray-300 cursor-not-allowed opacity-50 scale-100'}
              `}
              style={{ backgroundColor: time ? '#FF9F89' : undefined }}
            >
              PRÓXIMO
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Frequency
  return (
    <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
          E quantos dias por semana você acha REALISTA treinar?
        </h1>

        <div className="flex flex-col gap-3">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelectFrequency(opt.id)}
              className={`
                w-full py-4 px-6 rounded-2xl text-lg font-medium transition-all duration-200 border-2
                flex items-center justify-center
                ${frequency === opt.id 
                  ? 'bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-sm scale-[1.01]' 
                  : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className={`transition-all duration-500 overflow-hidden ${showMicroText ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
            {getMicroText()}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            disabled={!frequency}
            className={`
              w-full py-4 rounded-full text-white font-bold text-lg tracking-wide shadow-lg
              transform transition-all duration-200 active:scale-95
              ${frequency
                ? 'bg-[#FF9F89] hover:bg-[#FF8A6F] opacity-100 scale-100 text-white' 
                : 'bg-gray-300 cursor-not-allowed opacity-50 scale-100'}
            `}
            style={{ backgroundColor: frequency ? '#FF9F89' : undefined }}
          >
            PRÓXIMO
          </button>
        </div>
      </div>
    </div>
  )
}
