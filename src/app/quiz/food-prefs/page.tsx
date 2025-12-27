'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// DATA DEFINITIONS
const PROTEINS = [
  { id: 'chicken', label: 'Frango (peito, coxa, desfiado)' },
  { id: 'beef', label: 'Carne bovina magra (patinho, músculo, etc.)' },
  { id: 'eggs', label: 'Ovos' },
  { id: 'fish', label: 'Peixe (tilápia, sardinha, etc.)' },
  { id: 'tuna', label: 'Atum / sardinha em lata' },
  { id: 'cheese', label: 'Queijo branco / ricota' },
  { id: 'none', label: 'Não como quase nenhuma dessas / sou vegetariana' }
]

const CARBS = [
  { id: 'white_rice', label: 'Arroz branco' },
  { id: 'brown_rice', label: 'Arroz integral' },
  { id: 'beans', label: 'Feijão / lentilha / grão-de-bico' },
  { id: 'potato', label: 'Batata inglesa / batata-doce' },
  { id: 'roots', label: 'Mandioca / aipim / inhame' },
  { id: 'bread', label: 'Pão francês' },
  { id: 'whole_bread', label: 'Pão integral' },
  { id: 'pasta', label: 'Massa (macarrão)' },
  { id: 'flour', label: 'Farinha / cuscuz / tapioca' }
]

const VEGGIES = [
  { id: 'lettuce', label: 'Alface / rúcula' },
  { id: 'tomato', label: 'Tomate / pepino' },
  { id: 'carrot', label: 'Cenoura / beterraba' },
  { id: 'zucchini', label: 'Abobrinha / berinjela' },
  { id: 'broccoli', label: 'Brócolis / couve-flor' },
  { id: 'kale', label: 'Couve / espinafre' },
  { id: 'none', label: 'Não sou muito de salada, só como o básico' }
]

const PREP_STYLES = [
  { id: 'fast', label: 'Coisas rápidas: grelhado, cozido, assado simples' },
  { id: 'no_time', label: 'Não tenho tempo: preciso de coisas que dê pra esquentar / montar rápido' },
  { id: 'cook', label: 'Gosto de cozinhar, posso fazer receitas um pouco mais elaboradas' },
  { id: 'out', label: 'Muitas vezes como fora de casa / marmita' }
]

export default function FoodPrefsPage() {
  const { state, updateState, setCurrentStep } = useQuiz()
  const router = useRouter()
  
  // 0=Protein, 1=Carbs, 2=Veggies, 3=Prep, 4=MicroText
  const [step, setStep] = useState(0)
  
  const [proteins, setProteins] = useState<string[]>([])
  const [carbs, setCarbs] = useState<string[]>([])
  const [veggies, setVeggies] = useState<string[]>([])
  const [prep, setPrep] = useState<string | null>(null)

  useEffect(() => {
    setCurrentStep(8)
  }, [setCurrentStep])

  const handleMultiSelect = (id: string, list: string[], setList: any) => {
    // Exclusive 'none'
    if (id === 'none') {
      setList(['none'])
      return
    }
    
    let updated = list.filter(i => i !== 'none')
    if (updated.includes(id)) {
      updated = updated.filter(i => i !== id)
    } else {
      updated = [...updated, id]
    }
    setList(updated)
  }

  const handleNext = () => {
    if (step === 0) {
      updateState({ proteinPrefs: proteins })
      setStep(1)
    } else if (step === 1) {
      updateState({ carbPrefs: carbs })
      setStep(2)
    } else if (step === 2) {
      updateState({ veggiePrefs: veggies })
      setStep(3)
    } else if (step === 3) {
      updateState({ prepStyle: prep })
      setStep(4) // Show final microtext
    } else {
      router.push('/quiz/dreams')
    }
  }

  // STEP 0: PROTEINS
  if (step === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
            Quais dessas PROTEÍNAS você gosta e costuma ter em casa?
          </h1>
          <p className="text-xs text-center text-gray-400 uppercase tracking-wide -mt-4">(pode marcar várias)</p>
          <div className="flex flex-col gap-3">
            {PROTEINS.map((opt) => {
              const isSelected = proteins.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => handleMultiSelect(opt.id, proteins, setProteins)}
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
            <button onClick={handleNext} disabled={proteins.length === 0} className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#FF6B6B]">PRÓXIMO</button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 1: CARBS
  if (step === 1) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
            Quais dessas CARBOIDRATOS fazem parte da sua rotina?
          </h1>
          <p className="text-xs text-center text-gray-400 uppercase tracking-wide -mt-4">(pode marcar várias)</p>
          <div className="flex flex-col gap-3">
            {CARBS.map((opt) => {
              const isSelected = carbs.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => handleMultiSelect(opt.id, carbs, setCarbs)}
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
            <button onClick={handleNext} disabled={carbs.length === 0} className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#FF6B6B]">PRÓXIMO</button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 2: VEGGIES
  if (step === 2) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
            E de VERDURAS / SALADAS, o que você gosta de verdade?
          </h1>
          <p className="text-xs text-center text-gray-400 uppercase tracking-wide -mt-4">(pode marcar várias)</p>
          <div className="flex flex-col gap-3">
            {VEGGIES.map((opt) => {
              const isSelected = veggies.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => handleMultiSelect(opt.id, veggies, setVeggies)}
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
            <button onClick={handleNext} disabled={veggies.length === 0} className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#FF6B6B]">PRÓXIMO</button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 3: PREP
  if (step === 3) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold text-center text-[#1F2937]">
            Como você prefere que seja a preparação das comidas?
          </h1>
          <div className="flex flex-col gap-3">
            {PREP_STYLES.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPrep(opt.id)}
                className={`w-full py-4 px-6 rounded-2xl text-lg font-medium transition-all duration-200 border-2 flex items-center justify-center text-center ${prep === opt.id ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]' : 'bg-gray-50 text-gray-700 border-transparent'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button onClick={handleNext} disabled={!prep} className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#FF6B6B]">PRÓXIMO</button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 4: MICROTEXT
  if (step === 4) {
    return (
      <div className="flex-1 flex flex-col justify-center pb-24 animate-in fade-in duration-500">
        <div className="space-y-6 text-center">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
            <p className="text-blue-900 leading-relaxed text-lg font-medium mb-3">
              Seu plano usa sua <strong>TMB</strong> (calorias que seu corpo gasta por dia) + seus alimentos favoritos.
            </p>
            <p className="text-blue-900 leading-relaxed text-lg font-bold">
              Resultado: dieta exata pra VOCÊ secar barriga, sem fome.
            </p>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button onClick={handleNext} className="w-full py-4 rounded-full text-white font-bold text-lg bg-[#FF6B6B]">
              Perfeito, continuar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
