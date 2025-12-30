'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useQuiz } from '@/context/QuizContext'
import { useEffect, Suspense } from 'react'

function WelcomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updateState } = useQuiz()

  useEffect(() => {
    // Redireciona automaticamente para a primeira pergunta
    router.push('/quiz/objective')
  }, [router])

  return null // Não renderiza nada enquanto redireciona
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Carregando...</div>}>
      <WelcomeContent />
    </Suspense>
  )
}
