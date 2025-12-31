import { createClient } from '@/lib/supabase/server'
import { DietOnboardingForm } from './diet-onboarding-form'
import { DietTracker } from './diet-tracker'
import { GenerateDietButton } from './generate-button'
import { Utensils } from 'lucide-react'

export default async function DietPage({ searchParams }: { searchParams?: { reconfigure?: string } }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Faça login para ver sua dieta.</div>

  // Fetch User Plan & Preferences
  const { data: userData } = await supabase.from('users').select('plan_type').eq('id', user.id).single()
  const { data: prefs } = await supabase.from('diet_preferences').select('*').eq('user_id', user.id).eq('is_active', true).single()
  
  // 1. Fetch Active Diet Snapshot
  const { data: snapshot } = await supabase
    .from('diet_snapshots')
    .select('*, snapshot_meals(*, snapshot_items(*))')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  // 2. Fetch Daily Tracking
  const today = new Date().toISOString().split('T')[0]
  const { data: tracking } = await supabase
    .from('daily_tracking')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const forceReconfigure = searchParams?.reconfigure === '1'

  // SCENARIO 1: Force Reconfigure OR No Snapshot (Needs Generation)
  if (forceReconfigure || !snapshot) {
    // Always show onboarding form when forcing reconfigure
    if (forceReconfigure) {
      return <DietOnboardingForm userId={user.id} />
    }

    // If no preferences, show onboarding form
    if (!prefs) {
      return <DietOnboardingForm userId={user.id} />
    }

    // If has preferences but no snapshot, show generate button
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
        <div className="p-4 bg-orange-100 rounded-full">
          <Utensils className="h-10 w-10 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Seus dados estão prontos!</h1>
        <p className="text-gray-500 max-w-md">
          Recebemos suas preferências. Clique abaixo para gerar seu plano alimentar personalizado agora mesmo.
        </p>
        <GenerateDietButton userId={user.id} />
      </div>
    )
  }

  // SCENARIO 2: Has Snapshot -> Show Tracker
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">Minha Dieta</h1>
            <p className="text-gray-500 text-sm">Acompanhe suas refeições de hoje</p>
         </div>
         <div className="flex flex-col items-end gap-2">
             <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
             </span>
             <GenerateDietButton userId={user.id} variant="update" />
             <a href="/dieta/pdf" target="_blank" className="text-xs underline text-primary">Gerar PDF da Dieta</a>
         </div>
      </div>

      <DietTracker 
        snapshot={snapshot} 
        dailyTracking={tracking} 
        date={today}
      />
    </div>
  )
}
