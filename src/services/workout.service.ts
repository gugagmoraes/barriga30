import { createClient } from '@/lib/supabase/server'

export async function getNextWorkoutForUser(userId: string) {
    const supabase = await createClient()

    // 1. Get User Level
    const { data: user } = await supabase.from('users').select('workout_level').eq('id', userId).single()
    const userLevel = user?.workout_level || 'beginner'

    // 2. Determine Rotation based on Day of Year (Deterministic for "Workout of the Day")
    // This ensures it changes every 24h regardless of completion
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const diffMs = now.getTime() - startOfYear.getTime()
    const oneDayMs = 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diffMs / oneDayMs)
    
    // Rotation Sequence: A -> B -> C
    const types = ['A', 'B', 'C'] as const
    const nextType = types[dayOfYear % 3]

    // 3. Fetch the Workout
    const { data: workout } = await supabase
        .from('workouts')
        .select('*')
        .eq('level', userLevel)
        .eq('type', nextType)
        .eq('is_active', true)
        .maybeSingle()

    // 4. Return Placeholder if no workout exists in DB (Critical Fix)
    if (!workout) {
        // Try to find ANY active workout for this level to avoid 404
        const { data: fallbackWorkout } = await supabase
            .from('workouts')
            .select('*')
            .eq('level', userLevel)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle()
        
        if (fallbackWorkout) return fallbackWorkout

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
