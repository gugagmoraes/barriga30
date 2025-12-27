import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlayCircle, Clock, BarChart } from 'lucide-react'

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const { data: workouts } = await supabase.from('workouts').select('*').eq('is_active', true).order('created_at', { ascending: true })

  // If no workouts, mock some for display
  const displayWorkouts = workouts && workouts.length > 0 ? workouts : [
      { id: '1', name: 'Treino A - Full Body', level: 'beginner', duration_minutes: 30, video_url: '' },
      { id: '2', name: 'Treino B - Cardio Abs', level: 'beginner', duration_minutes: 25, video_url: '' },
      { id: '3', name: 'Treino C - Pernas e Glúteos', level: 'beginner', duration_minutes: 35, video_url: '' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meus Treinos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayWorkouts.map((workout) => (
          <Link key={workout.id} href={`/treinos/${workout.id}`} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group-hover:shadow-md transition">
               <div className="h-40 bg-gray-100 relative">
                  {/* Thumbnail placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <PlayCircle className="h-12 w-12 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {workout.duration_minutes}:00
                  </div>
               </div>
               <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">{workout.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                     <div className="flex items-center capitalize">
                        <BarChart className="h-4 w-4 mr-1" />
                        {workout.level === 'beginner' ? 'Iniciante' : workout.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                     </div>
                  </div>
               </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
