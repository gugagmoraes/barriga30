import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlayCircle, Clock, BarChart, Lock } from 'lucide-react'

function normalizeBunnyEmbedUrl(url: unknown) {
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed.startsWith('https://')) return trimmed

  try {
    const parsed = new URL(trimmed)
    if (!parsed.hostname.endsWith('mediadelivery.net')) return trimmed
    if (!parsed.pathname.startsWith('/embed/')) return trimmed
    parsed.searchParams.set('autoplay', 'false')
    return parsed.toString()
  } catch {
    return trimmed
  }
}

function isValidFullEmbedUrl(url: unknown) {
  if (typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed.startsWith('https://')) return false
  try {
    const parsed = new URL(trimmed)
    if (!parsed.hostname) return false
    if (parsed.pathname === '/' || parsed.pathname.length < 2) return false
    return true
  } catch {
    return false
  }
}

const levelOrder = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3
}

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch user profile for plan restriction logic
   let userPlan = 'basic'
   let userLevel = 'beginner'
 
   if (user) {
     const { data: profile } = await supabase.from('users').select('plan_type, workout_level').eq('id', user.id).single()
     if (profile) {
         userPlan = profile.plan_type || 'basic'
         userLevel = profile.workout_level || 'beginner'
     }
   }

  const { data: workouts } = await supabase.from('workouts').select('*').eq('is_active', true).order('created_at', { ascending: true })

  // If no workouts, mock some for display
  const allWorkouts = workouts && workouts.length > 0 ? workouts : [
      { id: '1', name: 'Treino A - Full Body', level: 'beginner', duration_minutes: 30, video_url: '' },
      { id: '2', name: 'Treino B - Cardio Abs', level: 'beginner', duration_minutes: 25, video_url: '' },
      { id: '3', name: 'Treino C - Pernas e Glúteos', level: 'beginner', duration_minutes: 35, video_url: '' },
      // Add mocks for other levels if needed for testing visually, but usually DB has them.
  ]

  // Filter Logic:
  // If Basic: Show ALL levels but lock higher levels.
  // If Plus/VIP: Show ALL levels unlocked.
  const displayWorkouts = allWorkouts

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meus Treinos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayWorkouts.map((workout) => {
            const isLocked = userPlan === 'basic' && 
                             levelOrder[workout.level as keyof typeof levelOrder] !== levelOrder[userLevel as keyof typeof levelOrder];

            return (
              <div key={workout.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition relative ${isLocked ? 'grayscale opacity-70 pointer-events-none' : ''}`}>
                
                {isLocked && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[1px]">
                        <div className="bg-white/90 p-4 rounded-xl shadow-lg text-center border border-gray-200">
                            <Lock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                            <p className="font-bold text-gray-900 text-sm mb-1">Nível Bloqueado</p>
                            <p className="text-xs text-gray-600 mb-3">Faça Upgrade para Desbloquear!</p>
                            <div className="pointer-events-auto">
                                <Link href="/register?plan=plus">
                                    <span className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:shadow-md transition-all cursor-pointer">
                                        Ser Plus
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-gray-100 relative">
                  {isValidFullEmbedUrl(workout.video_url) ? (
                    <iframe
                      src={normalizeBunnyEmbedUrl(workout.video_url) || workout.video_url}
                      width="100%"
                      height="315px"
                      style={{ border: 0, borderRadius: 12 }}
                      loading="lazy"
                      allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="h-[315px] flex flex-col items-center justify-center text-center px-4">
                      <PlayCircle className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">Vídeo indisponível no momento</p>
                    </div>
                  )}
    
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {workout.duration_minutes}:00
                  </div>
                </div>
    
                <div className="p-4">
                  <Link href={`/treinos/${workout.id}`} className={`block group ${isLocked ? 'pointer-events-none' : ''}`}>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">{workout.name}</h3>
                  </Link>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center capitalize">
                      <BarChart className="h-4 w-4 mr-1" />
                      {workout.level === 'beginner' ? 'Iniciante' : workout.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                    </div>
                  </div>
                </div>
              </div>
            )
        })}
      </div>
    </div>
  )
}
