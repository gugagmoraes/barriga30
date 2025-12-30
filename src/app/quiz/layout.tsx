'use client'

import { QuizProvider, useQuiz } from '@/context/QuizContext'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Inner component to access context
function QuizHeader() {
  const router = useRouter()
  const { currentStep } = useQuiz()

  return (
    <header className="px-6 py-4 flex items-center justify-between relative">
      <button 
        onClick={() => router.back()} 
        className="p-3 -ml-2 text-gray-500 hover:text-gray-800 transition-colors bg-gray-50 rounded-full hover:bg-gray-100"
        aria-label="Voltar"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
          PERFIL DEMOGRÁFICO
        </span>
        {/* Stepper / Progress Bar - 17 Steps */}
        <div className="flex gap-1">
          {Array.from({ length: 17 }).map((_, i) => {
            const stepNum = i + 1
            const isActive = stepNum === currentStep
            const isCompleted = stepNum < currentStep
            
            return (
              <div 
                key={i} 
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${isActive ? 'w-8 bg-[#1E6B7B]' : 'w-1.5'}
                  ${isCompleted ? 'bg-[#1E6B7B] opacity-50' : ''}
                  ${!isActive && !isCompleted ? 'bg-[#E5E0D8]' : ''}
                `}
              ></div>
            )
          })}
        </div>
      </div>
      
      <div className="w-6"></div> {/* Spacer for centering */}
    </header>
  )
}

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QuizProvider>
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans text-[#1F2937]">
        <QuizHeader />
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative max-w-md mx-auto w-full px-6">
          {children}
        </main>
      </div>
    </QuizProvider>
  )
}
