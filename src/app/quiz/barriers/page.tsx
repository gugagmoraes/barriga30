'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const BARRIERS = [
  { id: 'discipline', label: 'Falta de disciplina / desisto rápido' },
  { id: 'hard_diets', label: 'Dietas muito difíceis / passa fome' },
  { id: 'confusion', label: 'Não saber o que comer' },
  { id: 'messy_workout', label: 'Não ter treino organizado' },
  { id: 'time', label: 'Falta de tempo' },
  { id: 'motivation', label: 'Falta de motivação / ninguém me apoiando' },
  { id: 'pain', label: 'Dor / limitações físicas' }
]

export default function BarriersPage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  
  const [step, setStep] = useState(0) // 0=Barriers, 1=FinalText
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    setCurrentStep(10)
  }, [setCurrentStep])

  const handleSelect = (id: string) => {
    let updated = [...selected]
    if (updated.includes(id)) updated = updated.filter(i => i !== id)
    else updated = [...updated, id]
    setSelected(updated)
  }

  const handleNext = () => {
    if (step === 0) {
      updateState({ barriers: selected })
      setStep(1)
    } else {
      router.push('/quiz/summary')
    }
  }

  // Get selected barriers labels for dynamic text
  const getSelectedLabels = () => {
    if (selected.length === 0) return ''
    const labels = selected.map(id => BARRIERS.find(b => b.id === id)?.label).filter(Boolean)
    // Take first 2 for brevity
    return labels.slice(0, 2).map(l => l?.split('/')[0].trim()).join(', ')
  }

  const getTimeLabel = () => {
    const time = state.workoutTime || '20_min'
    return time.replace('_min', '').replace('_plus', '+')
  }

  // STEP 0: BARRIERS
  if (step === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
            O que mais te atrapalhou nas outras tentativas de emagrecer?
          </h1>
          <p className="text-xs text-center text-gray-400 uppercase tracking-wide -mt-4">(pode marcar várias)</p>
          <div className="flex flex-col gap-3">
            {BARRIERS.map((opt) => {
              const isSelected = selected.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
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
            <button onClick={handleNext} disabled={selected.length === 0} className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#FF6B6B]">PRÓXIMO</button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 1: FINAL TEXT
  if (step === 1) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-6 text-center">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm text-left">
            <p className="text-blue-900 font-bold text-lg mb-4">
              Seus desafios ({getSelectedLabels()}) são normais. Por isso:
            </p>
            <ul className="text-blue-900 list-disc list-inside space-y-2 mb-4 opacity-90">
              <li>Treinos no SEU tempo ({getTimeLabel()} min)</li>
              <li>Dieta com SEUS alimentos, organizados pela sua TMB (calorias que seu corpo gasta por dia)</li>
              <li>App te lembra + pontua + mostra antes/depois com gráficos e números: Instagramável!</li>
            </ul>
            <p className="text-blue-900 font-bold text-lg text-center mt-6">Agora veja seu plano!</p>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button onClick={handleNext} className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#FF6B6B]">
              Ver meu plano de 30 dias
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
