import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Play, BarChart2, Award } from 'lucide-react'
import { UserStatsCard } from '@/components/dashboard/UserStatsCard'
import { BadgesCard } from '@/components/dashboard/BadgesCard'
import { WorkoutProgressionCard } from '@/components/dashboard/WorkoutProgressionCard'
import { RankingList } from '@/components/dashboard/RankingList'
import { redirect } from 'next/navigation'
import { getUserProgression } from '@/services/progression'
import { getWeeklyRanking } from '@/services/ranking'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { WaterTracker } from '@/components/dashboard/WaterTracker'
import { MealTracker } from '@/components/dashboard/MealTracker'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div>Carregando...</div>

  // Fetch Daily Tracking for Water/Meals
  const today = new Date().toISOString().split('T')[0]
  const { data: dailyTracking } = await supabase
    .from('daily_tracking')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  const waterAmount = dailyTracking?.water_ml || 0
  const mealsCompleted = dailyTracking?.meals_completed || 0

  // Fetch user diet preferences (for water goal)
  const { data: dietPrefs } = await supabase
      .from('diet_preferences')
      .select('weight, water_bottle_size_ml')
      .eq('user_id', user.id)
      .maybeSingle()

  const weight = dietPrefs?.weight || 70
  const bottleSize = dietPrefs?.water_bottle_size_ml || 500

  const { data: snapshot } = await supabase
    .from('diet_snapshots')
    .select('*, snapshot_meals(*, snapshot_items(*))')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  const meals = (snapshot?.snapshot_meals || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))

  // Fetch real gamification stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch Badges (Needed for logic check)
  const { data: unlockedBadges } = await supabase.from('user_badges').select('badge_id, badges(key)').eq('user_id', user.id)

  // DUOLINGO ONBOARDING CHECK REMOVED
  // const hasFirstWorkoutBadge = unlockedBadges?.some((ub: any) => ub.badges?.key === 'first_workout')
  // const currentXP = stats?.total_xp || 0
  // const isActivated = hasFirstWorkoutBadge || currentXP >= 50 
  // if (!isActivated) {
  //     redirect('/onboarding/start')
  // }

  // Fetch user profile & progression
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const progressionStatus = await getUserProgression(user.id)

  // Fetch Ranking
  const rankingEntries = await getWeeklyRanking()

  // Defaults if no stats yet
  const userStats = stats || {
    current_streak: 0,
    total_xp: 0,
    level: 1
  }

  // Fetch level info
  const { data: currentLevel } = await supabase
    .from('levels')
    .select('*')
    .eq('level', userStats.level)
    .single()

  const { data: nextLevel } = await supabase
    .from('levels')
    .select('*')
    .eq('level', userStats.level + 1)
    .single()

  // Fetch Badges for UI
  const { data: allBadges } = await supabase.from('badges').select('*')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {profile?.name || user.email?.split('@')[0]}!
        </h1>
      </div>

      {/* Upgrade Banner */}
      {profile?.plan_type !== 'vip' && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-200" />
                    Faça Upgrade do seu Plano
                </h3>
                <p className="text-amber-100 text-sm">
                    Desbloqueie treinos avançados, mentorias e muito mais pagando apenas a diferença.
                </p>
            </div>
            <Button asChild variant="secondary" className="whitespace-nowrap font-semibold shadow-sm hover:scale-105 transition-transform text-amber-900">
                <Link href="/upgrade">
                    Ver Opções de Upgrade
                </Link>
            </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Stats + Tabs (Progression / Ranking) */}
          <div className="space-y-6">
             <UserStatsCard 
                stats={userStats} 
                nextLevel={nextLevel} 
                currentLevelTitle={currentLevel?.title || 'Iniciante'} 
             />
             
             <Tabs defaultValue="progression" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="progression" className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        Meu Progresso
                    </TabsTrigger>
                    <TabsTrigger value="ranking" className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Ranking Semanal
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="progression" className="mt-0 space-y-6">
                    {/* Dynamic Progression Card */}
                    <WorkoutProgressionCard 
                        status={progressionStatus} 
                        isCriticalMode={profile?.critical_mode_active || false}
                        plan={profile?.plan_type || 'basic'}
                    />
                    
                    {/* Quick Start Card (Secondary) */}
                    <div className="bg-primary rounded-xl p-6 text-primary-foreground shadow-lg relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer">
                        <div className="relative z-10">
                            <h2 className="text-lg font-semibold mb-2">Treino de Hoje</h2>
                            <p className="text-primary-foreground/90 mb-4 text-sm">Queime gordura abdominal em 30 minutos.</p>
                            <Link href="/treinos/today">
                                <Button variant="secondary" className="w-full sm:w-auto font-bold group-hover:scale-105 transition-transform">
                                    <Play className="h-4 w-4 mr-2" />
                                    Começar Treino
                                </Button>
                            </Link>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    </div>
                </TabsContent>
                
                <TabsContent value="ranking" className="mt-0">
                    <RankingList 
                        entries={rankingEntries} 
                        currentUserId={user.id} 
                    />
                </TabsContent>
             </Tabs>
          </div>

          {/* Side Column (Badges & Quick Actions) */}
          <div className="space-y-6">
             {/* Gamification Trackers */}
             <div className="grid grid-cols-1 gap-4">
                <WaterTracker 
                    currentAmount={waterAmount} 
                    weight={weight}
                    bottleSize={bottleSize}
                />
                <MealTracker mealsCompleted={mealsCompleted} meals={meals} />
             </div>

             <BadgesCard 
                allBadges={allBadges || []} 
                unlockedBadges={unlockedBadges || []} 
             />

             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                 <h3 className="font-semibold text-gray-900 mb-4">Acesso Rápido</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <Link href="/dieta" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center hover:scale-105 active:scale-95 duration-200">
                        <span className="block font-medium text-primary">Minha Dieta</span>
                    </Link>
                    <Link href="/lista-compras" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center hover:scale-105 active:scale-95 duration-200">
                        <span className="block font-medium text-primary">Lista de Compras</span>
                    </Link>
                    <Link href="/progresso" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center hover:scale-105 active:scale-95 duration-200 col-span-2">
                        <span className="block font-medium text-primary">Meu Progresso Completo</span>
                    </Link>
                 </div>
             </div>
          </div>
      </div>
    </div>
  )
}
