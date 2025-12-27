'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateInitialDiet } from './actions'
import { Wand2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function GenerateDietButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      await generateInitialDiet(userId)
      router.refresh()
    } catch (error) {
      console.error('Failed to generate diet:', error)
      alert('Erro ao gerar dieta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={isLoading} className="bg-primary hover:bg-primary/90">
      {isLoading ? (
        'Gerando...'
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Gerar Plano Inicial
        </>
      )}
    </Button>
  )
}
