import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WorkoutPlayer from '@/components/workout/WorkoutPlayer'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  let workout;
  // Check if id is a UUID (Supabase ID) or one of our mock IDs
  const isMock = ['1', '2', '3'].includes(id);

  if (isMock) {
      workout = {
          id: id,
          name: id === '1' ? 'Treino A - Full Body' : id === '2' ? 'Treino B - Cardio Abs' : 'Treino C - Pernas',
          duration_minutes: 30,
          exercises: [
              { name: 'Aquecimento: Polichinelos', duration: 30 },
              { name: 'Agachamento Livre', duration: 45 },
              { name: 'Descanso', duration: 15 },
              { name: 'Flexão de Braço', duration: 45 },
              { name: 'Descanso', duration: 15 },
              { name: 'Prancha Abdominal', duration: 30 },
              { name: 'Resfriamento: Alongamento', duration: 30 },
          ]
      }
  } else {
      const { data } = await supabase.from('workouts').select('*').eq('id', id).single()
      workout = data
  }

  if (!workout) {
    notFound()
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
       <WorkoutPlayer workout={workout} />
    </div>
  )
}
