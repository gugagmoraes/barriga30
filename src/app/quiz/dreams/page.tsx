'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const DREAMS = [
  { id: 'clothes', label: 'Entrar em roupas que hoje não servem' },
  { id: 'photos', label: 'Não ter vergonha de foto de lado / corpo inteiro' },
  { id: 'mirror', label: 'Se olhar no espelho de biquíni e gostar do que vê' },
  { id: 'kids', label: 'Ter fôlego pra brincar com filhos/netos' },
  { id: 'energy', label: 'Ter mais disposição pra trabalhar / cuidar da casa' },
  { id: 'health', label: 'Melhorar exames e parar de viver com medo de resultado' },
  { id: 'intimacy', label: 'Se sentir mais confiante na cama, sem querer esconder a barriga' }
]

const CHANGES = [
  { id: 'belly_mirror', label: 'Ver a barriga visivelmente mais seca no espelho' },
  { id: 'pants', label: 'Sentir a calça folgando e menos inchaço' },
  { id: 'sleep', label: 'Dormir melhor e ter mais energia no dia a dia' },
  { id: 'confident_naked', label: 'Se sentir mais segura e confiante nua / na hora H' },
  { id: 'pride', label: 'Olhar no espelho e sentir orgulho de estar fazendo por você' }
]

export default function DreamsPage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  
  const [step, setStep] = useState(0) // 0=Dreams, 1=OneThing, 2=MicroText
  const [selectedDreams, setSelectedDreams] = useState<string[]>([])
  const [mainChange, setMainChange] = useState<string | null>(null)

  useEffect(() => {
    setCurrentStep(9)
  }, [setCurrentStep])

  const handleDreamsSelect = (id: string) => {
    let updated = [...selectedDreams]
    if (updated.includes(id)) updated = updated.filter(i => i !== id)
    else updated = [...updated, id]
    setSelectedDreams(updated)
  }

  const handleNext = () => {
    if (step === 0) {
      updateState({ dreams: selectedDreams })
      setStep(1)
    } else if (step === 1) {
      updateState({ mainChange: mainChange })
      setStep(2)
    } else {
      router.push('/quiz/barriers')
    }
  }

  // STEP 0: DREAMS
  if (step === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
            Quando você imagina 2026 com a barriga bem menor, o que mais mexe com você?
          </h1>
          <p className="text-xs text-center text-gray-400 uppercase tracking-wide -mt-4">(pode marcar várias)</p>
          <div className="flex flex-col gap-3">
            {DREAMS.map((opt) => {
              const isSelected = selectedDreams.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => handleDreamsSelect(opt.id)}
                  className={`w-full py-4 px-6 rounded-2xl text-lg font-medium transition-all duration-200 border-2 flex items-center justify-between ${isSelected ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]' : 'bg-gray-50 text-gray-700 border-transparent'}`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <span>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button onClick={handleNext} disabled={selectedDreams.length === 0} className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#FF6B6B]">PRÓXIMO</button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 1: ONE THING
  if (step === 1) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
            Se tivesse que escolher APENAS 1 coisa pra começar a mudar nesses próximos 30 dias, qual seria?
          </h1>
          <div className="flex flex-col gap-3">
            {CHANGES.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMainChange(opt.id)}
                className={`w-full py-4 px-6 rounded-2xl text-lg font-medium transition-all duration-200 border-2 flex items-center justify-center text-center ${mainChange === opt.id ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]' : 'bg-gray-50 text-gray-700 border-transparent'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button onClick={handleNext} disabled={!mainChange} className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#FF6B6B]">PRÓXIMO</button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 2: MICROTEXT
  if (step === 2) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-6 text-center">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm text-left">
            <p className="text-blue-900 font-bold text-lg mb-2">
              Guarda essa resposta{state.name ? `, ${state.name}` : ''}.
            </p>
            <p className="text-blue-900 mb-4">Não é só sobre ‘perder tantos kg’. É sobre como você quer viver:</p>
            <ul className="space-y-3 mb-6">
              {[
                'nas roupas que escolhe',
                'na energia com a família',
                'na segurança no seu relacionamento',
                'na sua saúde e nos seus exames.'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-blue-900 opacity-90">
                  <div className="mt-1 min-w-[20px]">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-blue-900 font-medium">O plano que a gente vai montar agora é o primeiro passo pra isso virar realidade — e não ficar só na sua cabeça.</p>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button onClick={handleNext} className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#FF6B6B]">
              Continuar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
