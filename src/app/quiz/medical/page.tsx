'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { QuizOption } from '@/components/quiz/QuizOption'
import { QuizButton } from '@/components/quiz/QuizButton'

const PERSONAL_CONDITIONS = [
  { id: 'hypertension', label: 'Pressão alta' },
  { id: 'cholesterol', label: 'Colesterol alto' },
  { id: 'insomnia', label: 'Insônia' },
  { id: 'osteoarthritis', label: 'Osteoartrite' },
  { id: 'depression', label: 'Depressão' },
  { id: 'other', label: 'Outro' },
  { id: 'none', label: 'Nenhum' }
]

const FAMILY_CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hypertension', label: 'Pressão alta' },
  { id: 'cancer', label: 'Câncer' },
  { id: 'heart', label: 'Infarto / AVC cedo' },
  { id: 'mental', label: 'Depressão / problemas mentais' },
  { id: 'obesity', label: 'Obesidade' },
  { id: 'thyroid', label: 'Problemas de tireoide' },
  { id: 'none', label: 'Nenhum / não sei' }
]

export default function MedicalPage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  
  const [step, setStep] = useState(0) // 0 = Personal, 1 = Family
  const [personal, setPersonal] = useState<string[]>([])
  const [family, setFamily] = useState<string[]>([])
  const [showMicroText, setShowMicroText] = useState(false)

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])

  const handleSelect = (id: string, type: 'personal' | 'family') => {
    const currentList = type === 'personal' ? personal : family
    const setList = type === 'personal' ? setPersonal : setFamily
    
    // Exclusive 'none' logic
    if (id === 'none') {
      setList(['none'])
      if (type === 'personal') setShowMicroText(false) // No warning for none
      return
    }

    let updated = currentList.filter(i => i !== 'none')
    if (updated.includes(id)) {
      updated = updated.filter(i => i !== id)
    } else {
      updated = [...updated, id]
    }
    
    setList(updated)
    if (type === 'personal' && updated.length > 0) setShowMicroText(true)
    if (type === 'personal' && updated.length === 0) setShowMicroText(false)
  }

  const handleNext = () => {
    if (step === 0) {
      // Save personal and move to family
      updateState({ medicalConditions: personal })
      setStep(1)
      setShowMicroText(false) // Reset for next step logic if needed, but family logic is different
    } else {
      // Save family and finish block
      updateState({ familyHistory: family })
      
      // Check for warning condition (Family issue + Belly issue)
      const hasFamilyIssue = family.length > 0 && !family.includes('none')
      const hasBellyIssue = state.bodyParts.includes('belly')
      
      if (hasFamilyIssue && hasBellyIssue) {
        setStep(2)
      } else {
        router.push('/quiz/routine')
      }
    }
  }

  // Render Step 0: Personal
  if (step === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
            Você já recebeu diagnóstico de algum desses?
          </h1>
          <p className="text-xs text-center text-gray-400 uppercase tracking-wide -mt-4">
            (pode marcar mais de um)
          </p>

          <div className="flex flex-col gap-3">
            {PERSONAL_CONDITIONS.map((opt) => (
              <QuizOption
                key={opt.id}
                label={opt.label}
                selected={personal.includes(opt.id)}
                onClick={() => handleSelect(opt.id, 'personal')}
              />
            ))}
          </div>

          <div className={`transition-all duration-500 overflow-hidden ${showMicroText ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900 text-sm leading-relaxed">
              <p className="font-bold mb-2">Obrigada por compartilhar.</p>
              <p>Seu plano vai ser seguro e gentil com essas condições – treinos leves + alimentação que ajuda nisso tudo.</p>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <QuizButton
              onClick={handleNext}
              disabled={personal.length === 0}
              className={personal.length === 0 ? 'bg-[#E5E7EB] text-white' : ''}
            >
              Próximo
            </QuizButton>
          </div>
        </div>
      </div>
    )
  }

  // Render Step 1: Family
  if (step === 1) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
            Na sua família tem casos de:
          </h1>
          <p className="text-xs text-center text-gray-400 uppercase tracking-wide -mt-4">
            (pode marcar mais de um)
          </p>

          <div className="flex flex-col gap-3">
            {FAMILY_CONDITIONS.map((opt) => (
               <QuizOption
                 key={opt.id}
                 label={opt.label}
                 selected={family.includes(opt.id)}
                 onClick={() => handleSelect(opt.id, 'family')}
               />
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <QuizButton
              onClick={handleNext}
              disabled={family.length === 0}
              className={family.length === 0 ? 'bg-[#E5E7EB] text-white' : ''}
            >
              Próximo
            </QuizButton>
          </div>
        </div>
      </div>
    )
  }

  // Render Step 2: Warning
  if (step === 2) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-6 text-center">
          <div className="bg-red-50 p-8 rounded-2xl border border-red-100 shadow-sm">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Atenção
            </h2>
            <p className="text-red-600 leading-relaxed mb-4 text-lg font-bold">
              Barriga + histórico familiar = sinal vermelho do corpo.
            </p>
            <p className="text-red-800 leading-relaxed font-medium">
              15 a 30 min/dia em casa já mudam esse quadro – sem loucura.
            </p>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <QuizButton
              onClick={() => router.push('/quiz/routine')}
            >
              Entendi, vamos cuidar disso
            </QuizButton>
          </div>
        </div>
      </div>
    )
  }

  return null
}
