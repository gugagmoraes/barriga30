'use client'

import { useActionState } from 'react'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form action={formAction} className="space-y-6">
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
              autoComplete="current-password"
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
            {isPending ? 'Entrando...' : 'Entrar'}
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
              Ou
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/register" className="font-medium text-primary hover:text-primary/90">
            Criar nova conta
          </Link>
        </div>
      </div>
    </div>
  )
}
