import { createClient } from '@/lib/supabase/server'

export async function getNextWorkoutForUser(userId: string) {
    const supabase = await createClient()

    // 1. Get User Level (Assuming saved in users table or defaulting to beginner)
    const { data: user } = await supabase.from('users').select('plan_type, activity_level').eq('id', userId).single()
    const userLevel = 'beginner' // TODO: Implement real level logic from quiz result

    // 2. Get Last Completed Workout to determine rotation
    const { data: lastLog } = await supabase
        .from('workout_logs')
        .select('workout_id, workouts(type)')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle() // Use maybeSingle to avoid error if no logs

    let nextType = 'A'
    if (lastLog && lastLog.workouts) {
        const lastType = (lastLog.workouts as any).type
        if (lastType === 'A') nextType = 'B'
        else if (lastType === 'B') nextType = 'C'
        else if (lastType === 'C') nextType = 'A'
    }

    // 3. Fetch the Workout
    const { data: workout } = await supabase
        .from('workouts')
        .select('*')
        .eq('level', userLevel)
        .eq('type', nextType)
        .maybeSingle() // Use maybeSingle to prevent 404/error if DB is empty

    // 4. Return Placeholder if no workout exists in DB (Critical Fix)
    if (!workout) {
        return {
            id: 'placeholder-config',
            name: `Treino ${nextType} (${userLevel})`,
            description: 'Treino em configuração. Em breve disponível.',
            level: userLevel,
            type: nextType,
            video_url: null,
            duration_minutes: 0,
            is_placeholder: true
        }
    }

    return workout
}

export async function getRegressionWorkout(currentWorkout: any) {
    if (currentWorkout.level === 'beginner') return null
    
    const supabase = await createClient()
    const targetLevel = currentWorkout.level === 'advanced' ? 'intermediate' : 'beginner'

    const { data: workout } = await supabase
        .from('workouts')
        .select('*')
        .eq('level', targetLevel)
        .eq('type', currentWorkout.type)
        .single()
        
    return workout
}
