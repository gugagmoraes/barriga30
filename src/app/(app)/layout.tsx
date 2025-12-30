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

  // Check Onboarding Status
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_complete) {
    // Prevent infinite loop if we are already on an onboarding page (if we had one inside (app))
    // But Quiz is at /quiz (outside (app)), so this redirect is safe.
    redirect('/quiz/welcome?mode=onboarding') 
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        {children}
      </main>
    </div>
  )
}
