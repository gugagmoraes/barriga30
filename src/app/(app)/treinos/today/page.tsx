import { createClient } from '@/lib/supabase/server'
import { getNextWorkoutForUser } from '@/services/workout.service'
import { redirect } from 'next/navigation'

export default async function TodayWorkoutPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    const workout = await getNextWorkoutForUser(user.id)

    if (workout) {
        redirect(`/treinos/${workout.id}`)
    }

    // Fallback if no workout found (e.g., no workouts seeded for level)
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <h1 className="text-xl font-bold mb-2">Nenhum treino encontrado</h1>
            <p className="text-gray-500">
                Parece que não temos um treino configurado para o seu nível ainda.
                Entre em contato com o suporte.
            </p>
        </div>
    )
}
