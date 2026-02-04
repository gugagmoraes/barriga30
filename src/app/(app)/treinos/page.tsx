import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlayCircle, Clock, BarChart } from 'lucide-react'

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
  // If Basic: Show ONLY current level.
  // If Plus/VIP: Show ALL levels.
  const displayWorkouts = userPlan === 'basic' 
      ? allWorkouts.filter(w => w.level === userLevel)
      : allWorkouts

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meus Treinos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayWorkouts.map((workout) => (
          <div key={workout.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition">
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
              <Link href={`/treinos/${workout.id}`} className="block group">
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
        ))}
      </div>
    </div>
  )
}
