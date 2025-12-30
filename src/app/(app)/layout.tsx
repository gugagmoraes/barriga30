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
    // Fallback: if there is a completed quiz submission, mark onboarding complete
    const { data: submission } = await supabase
      .from('quiz_submissions')
      .select('id,status,completed_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (submission) {
      await supabase
        .from('users')
        .update({ onboarding_complete: true })
        .eq('id', user.id)
      // continue to app without redirect
    } else {
      redirect('/quiz/welcome?mode=onboarding')
    }
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
