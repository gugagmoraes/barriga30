import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WorkoutPlayer from '@/components/workout/WorkoutPlayer'
import { getRegressionWorkout } from '@/services/workout.service'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: workout } = await supabase.from('workouts').select('*').eq('id', id).single()

  if (!workout) {
    notFound()
  }

  const regression = await getRegressionWorkout(workout)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
       <WorkoutPlayer workout={workout} regression={regression} />
    </div>
  )
}
