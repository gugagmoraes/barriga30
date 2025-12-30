'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { QuizButton } from '@/components/quiz/QuizButton'

export default function BiometricsPage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  
  // Single form state
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<string | null>(null)

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const isValid = () => {
    return (
      name.length > 1 &&
      weight && parseFloat(weight) > 20 &&
      height && parseInt(height) > 50 &&
      age && parseInt(age) > 10 &&
      gender
    )
  }

  const handleNext = () => {
    if (isValid()) {
      updateState({
        name,
        weight: parseFloat(weight),
        height: parseInt(height),
        age: parseInt(age),
        gender
      })
      router.push('/quiz/target-weight') // Redirect to new Target Weight screen
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid()) {
      handleNext()
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
      <div className="space-y-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-center text-[#1F2937]">
          Vamos aos dados básicos
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          {/* NAME */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Como você se chama?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Seu nome"
              className="w-full p-4 bg-[#F9F8F5] rounded-xl text-lg font-medium text-gray-900 placeholder-gray-400 border border-[#E5E0D8] focus:border-[#1E6B7B] focus:bg-white transition-all outline-none"
            />
          </div>

          {/* WEIGHT & HEIGHT */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Peso Hoje (kg)</label>
              <input
                type="tel"
                value={weight}
                onChange={(e) => /^\d*\.?\d{0,1}$/.test(e.target.value) && setWeight(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="00.0"
                className="w-full p-4 bg-[#F9F8F5] rounded-xl text-lg font-medium text-gray-900 placeholder-gray-400 border border-[#E5E0D8] focus:border-[#1E6B7B] focus:bg-white transition-all outline-none text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Altura (cm)</label>
              <input
                type="tel"
                value={height}
                onChange={(e) => /^\d*$/.test(e.target.value) && setHeight(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="000"
                maxLength={3}
                className="w-full p-4 bg-[#F9F8F5] rounded-xl text-lg font-medium text-gray-900 placeholder-gray-400 border border-[#E5E0D8] focus:border-[#1E6B7B] focus:bg-white transition-all outline-none text-center"
              />
            </div>
          </div>

          {/* AGE */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Quantos anos você tem?</label>
            <input
              type="tel"
              value={age}
              onChange={(e) => /^\d*$/.test(e.target.value) && setAge(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="00"
              maxLength={3}
              className="w-full p-4 bg-[#F9F8F5] rounded-xl text-lg font-medium text-gray-900 placeholder-gray-400 border border-[#E5E0D8] focus:border-[#1E6B7B] focus:bg-white transition-all outline-none text-center"
            />
          </div>

          {/* GENDER */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Com qual gênero você se identifica?</label>
            <div className="grid grid-cols-2 gap-4">
              {['Feminino', 'Masculino'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setGender(opt)}
                  className={`
                    py-4 rounded-xl font-bold text-sm transition-all duration-200 border
                    ${gender === opt 
                      ? 'bg-[#1E6B7B] text-white border-[#1E6B7B] shadow-md transform scale-[1.02]' 
                      : 'bg-[#F9F8F5] text-gray-600 border-[#E5E0D8] hover:bg-[#F0EFEB]'}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <QuizButton
            onClick={handleNext}
            disabled={!isValid()}
          >
            Próximo
          </QuizButton>
        </div>
      </div>
    </div>
  )
}
