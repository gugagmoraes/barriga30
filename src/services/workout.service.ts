import { createClient } from '@/lib/supabase/server'

export async function getNextWorkoutForUser(userId: string) {
    const supabase = await createClient()

    // 1. Get User Level & Progression
    const { data: user } = await supabase.from('users').select('workout_level, last_workout_date, last_completed_workout_type').eq('id', userId).single()
    const userLevel = user?.workout_level || 'beginner'
    const lastType = user?.last_completed_workout_type
    const lastDate = user?.last_workout_date

    // 2. Determine Next Workout Type (User-Specific Sequence ABC)
    // Sequence: A -> B -> C -> A ...
    // If no last workout (new user), start with A.
    // If user missed days, we pick up where left off (Continuous).
    
    let nextType = 'A' // Default for new users
    
    if (lastType) {
        // If user has a history, calculate next in sequence
        if (lastType === 'A') nextType = 'B'
        else if (lastType === 'B') nextType = 'C'
        else if (lastType === 'C') nextType = 'A'
        
        // Check if today is the SAME day as last completed workout?
        // Req: "Reset Daily... at 00:00". 
        // If user already did a workout TODAY, they should see the SAME workout as "Completed" 
        // OR the next one but locked? 
        // Usually "Workout of the Day" implies 1 per day.
        // If they completed 'A' today, showing 'B' immediately might be aggressive or good?
        // Req says: "If user concluded workout 'A' and didn't train next day... next available MUST be 'B'".
        // It implies 1 active workout "slot" that moves forward only when completed AND it's a new day?
        // Or moves forward immediately upon completion?
        // "A 'virada do dia'... deve ocorrer à 00:00... Após essa hora, se o usuário completou... o próximo... se torna disponível."
        // So: If completed today, wait for tomorrow to show next.
        
        const today = new Date().toISOString().split('T')[0]
        const lastWorkoutDay = lastDate ? new Date(lastDate).toISOString().split('T')[0] : null
        
        if (lastWorkoutDay === today) {
            // User already worked out today. 
            // We should return the workout they JUST did (so they can see it's done), 
            // NOT the next one yet.
            nextType = lastType 
        }
    }

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
        
        if (fallbackWorkout) return fallbackWorkout;

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
        .eq('is_active', true)
        .maybeSingle()
        
    return workout || null
}
