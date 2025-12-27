'use client'

import Link from 'next/link'
import { Home, Dumbbell, Utensils, TrendingUp, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">Barriga 30</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/treinos" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Treinos
              </Link>
              <Link href="/dieta" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dieta
              </Link>
              <Link href="/progresso" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Progresso
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
             <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-5 w-5 mr-2" />
                Sair
             </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu (bottom tab bar style) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
         <div className="grid grid-cols-5 gap-1 p-2">
             <Link href="/dashboard" className="flex flex-col items-center p-2 text-xs text-gray-500 hover:text-primary">
                <Home className="h-5 w-5 mb-1" />
                <span>Dash</span>
             </Link>
             <Link href="/treinos" className="flex flex-col items-center p-2 text-xs text-gray-500 hover:text-primary">
                <Dumbbell className="h-5 w-5 mb-1" />
                <span>Treinos</span>
             </Link>
             <Link href="/dieta" className="flex flex-col items-center p-2 text-xs text-gray-500 hover:text-primary">
                <Utensils className="h-5 w-5 mb-1" />
                <span>Dieta</span>
             </Link>
             <Link href="/progresso" className="flex flex-col items-center p-2 text-xs text-gray-500 hover:text-primary">
                <TrendingUp className="h-5 w-5 mb-1" />
                <span>Progresso</span>
             </Link>
             <button onClick={handleSignOut} className="flex flex-col items-center p-2 text-xs text-gray-500 hover:text-primary">
                <LogOut className="h-5 w-5 mb-1" />
                <span>Sair</span>
             </button>
         </div>
      </div>
    </nav>
  )
}
