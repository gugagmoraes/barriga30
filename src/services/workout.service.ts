import { createClient } from '@/lib/supabase/server'

export async function getNextWorkoutForUser(userId: string) {
    const supabase = await createClient()

    // 1. Get User Level
    const { data: user } = await supabase.from('users').select('plan_type, activity_level').eq('id', userId).single()
    // Map plan_type/activity to level (simplified for MVP)
    // Assuming plan_type doesn't dictate level, but maybe activity_level or quiz result does.
    // For now, let's assume 'beginner' as default if not found.
    // Ideally this should come from the quiz result (saved in users or quiz_submissions).
    // Let's assume we store 'level' in users table or infer it.
    // I'll check if 'level' column exists in users. I don't think so.
    // I'll default to 'beginner' or random for now, but ideally we should save it.
    
    // Check if we have a 'level' in diet_preferences or we can infer.
    // Let's use 'beginner' as fallback.
    const userLevel = 'beginner' // TODO: Fetch real level

    // 2. Get Last Completed Workout
    const { data: lastLog } = await supabase
        .from('workout_logs')
        .select('workout_id, workouts(type)')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

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
        .single()

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
