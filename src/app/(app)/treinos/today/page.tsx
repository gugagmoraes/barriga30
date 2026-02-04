import { createClient } from '@/lib/supabase/server'
import { getNextWorkoutForUser } from '@/services/workout.service'
import { redirect } from 'next/navigation'
import WorkoutPlayer from '@/components/workout/WorkoutPlayer'
import { getRegressionWorkout } from '@/services/workout.service'

export default async function TodayWorkoutPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    const workout = await getNextWorkoutForUser(user.id)

    if (!workout) {
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

    const regression = await getRegressionWorkout(workout)

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const { data: completionLog } = await supabase
        .from('user_activity_log')
        .select('id')
        .eq('user_id', user.id)
        .eq('activity_type', 'workout_completed')
        .eq('reference_id', workout.id)
        .gte('created_at', startOfDay.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    const completedToday = !!completionLog

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <WorkoutPlayer workout={workout} regression={regression} initialCompletedToday={completedToday} />
        </div>
    )
}
