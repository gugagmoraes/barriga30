import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WorkoutPlayer from '@/components/workout/WorkoutPlayer'
import { getRegressionWorkout } from '@/services/workout.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function WorkoutPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId: id } = await params
  
  // Handle Placeholder
  if (id === 'placeholder-config') {
      const placeholderWorkout = {
          id: 'placeholder-config',
          name: 'Treino em Configuração',
          video_url: null,
          description: 'Aguardando lançamento dos vídeos oficiais.',
          level: 'beginner',
          type: 'A'
      }
      return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <WorkoutPlayer workout={placeholderWorkout} />
        </div>
      )
  }

  const supabase = await createClient()
  
  const { data: workout } = await supabase.from('workouts').select('*').eq('id', id).single()

  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Treino não encontrado</h1>
        <p className="text-gray-600 mb-6">Não conseguimos localizar o treino solicitado.</p>
        <p className="text-xs text-gray-400 font-mono mb-8">ID: {id}</p>
        <a href="/treinos" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
          Voltar para Treinos
        </a>
      </div>
    )
  }

  const regression = await getRegressionWorkout(workout)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
       <WorkoutPlayer workout={workout} regression={regression} />
    </div>
  )
}
