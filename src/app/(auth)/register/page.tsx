'use client'

import { useActionState, useEffect, useState } from 'react'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RegisterForm() {
  const [state, formAction, isPending] = useActionState(signup, null)
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  
  const [initialName, setInitialName] = useState('')
  const [quizData, setQuizData] = useState('')

  useEffect(() => {
    // Tentar recuperar dados do Quiz
    const saved = localStorage.getItem('barriga30_quiz_official')
    if (saved) {
      setQuizData(saved)
      try {
        const parsed = JSON.parse(saved)
        if (parsed.name) {
          setInitialName(parsed.name)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="plan" value={plan || ''} />
        {/* Pass quiz data to the server action */}
        <input type="hidden" name="quiz_data" value={quizData} />
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome Completo
          </label>
          <div className="mt-1">
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Maria Silva"
              defaultValue={initialName}
              key={initialName} // Forçar re-render quando o nome carregar
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
            />
          </div>
        </div>

        {state?.error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
            {state.error}
          </div>
        )}

        <div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Criando conta...' : plan ? `Continuar para Pagamento (${plan})` : 'Criar Conta'}
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Já tem uma conta?
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="font-medium text-primary hover:text-primary/90">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
