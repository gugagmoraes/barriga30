import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // FORCE REMOVE: Any automatic redirect to quiz is REMOVED to prevent loops.
  // The app will assume that if the user is logged in, they can access the dashboard.
  // The quiz is now strictly opt-in or handled by specific flows, never a global guard.

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        {children}
      </main>
    </div>
  )
}
