import { createClient } from '@/lib/supabase/server';

export type WorkoutLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutType = 'A' | 'B' | 'C';

interface ProgressionStatus {
  currentLevel: WorkoutLevel;
  progress: {
    A: number; // Count / 5
    B: number;
    C: number;
  };
  canLevelUp: boolean;
  nextLevelLocked: boolean; // True if plan restriction blocks it
}

export async function getUserProgression(userId: string): Promise<ProgressionStatus> {
  const supabase = await createClient();

  // 1. Get User Info
  const { data: user } = await supabase.from('users').select('workout_level, plan').eq('id', userId).single();
  const currentLevel = user?.workout_level || 'beginner';
  const plan = user?.plan || 'basic';

  // 2. Count Completions for Current Level
  // We need to count logs where metadata->workoutLevel == currentLevel AND metadata->workoutType == A/B/C
  // This requires that we store this metadata in activity_log.
  // Assuming we start storing it now. For backward compatibility, old logs might miss it.
  
  const { data: logs } = await supabase
    .from('user_activity_log')
    .select('metadata')
    .eq('user_id', userId)
    .eq('activity_type', 'workout_completed');

  const counts = { A: 0, B: 0, C: 0 };

  logs?.forEach(log => {
    const meta = log.metadata || {};
    if (meta.level === currentLevel && meta.type) {
       if (counts[meta.type as WorkoutType] !== undefined) {
         counts[meta.type as WorkoutType]++;
       }
    }
  });

  // 3. Check Level Up Logic (5 of each)
  const isReady = counts.A >= 5 && counts.B >= 5 && counts.C >= 5;

  // 4. Check Plan Restrictions
  // Basic: Beginner -> Intermediate (Allowed). Intermediate -> Advanced (Blocked).
  let nextLevelLocked = false;
  if (isReady) {
    if (currentLevel === 'intermediate' && plan === 'basic') {
      nextLevelLocked = true;
    }
  }

  return {
    currentLevel,
    progress: counts,
    canLevelUp: isReady,
    nextLevelLocked
  };
}

export async function levelUpUser(userId: string) {
  const supabase = await createClient();
  const status = await getUserProgression(userId);

  if (!status.canLevelUp) return { success: false, message: 'Requisitos não cumpridos.' };
  if (status.nextLevelLocked) return { success: false, message: 'Upgrade necessário.' };

  const nextMap: Record<string, string> = {
    'beginner': 'intermediate',
    'intermediate': 'advanced',
    'advanced': 'advanced' // Max level
  };

  const nextLevel = nextMap[status.currentLevel];

  const { error } = await supabase
    .from('users')
    .update({ workout_level: nextLevel })
    .eq('id', userId);

  if (error) return { success: false, error };
  return { success: true, newLevel: nextLevel };
}

export async function toggleCriticalMode(userId: string, active: boolean) {
   const supabase = await createClient();
   // Check if VIP
   const { data: user } = await supabase.from('users').select('plan').eq('id', userId).single();
   if (user?.plan !== 'vip') return { success: false, message: 'Apenas VIP' };

   const { error } = await supabase.from('users').update({ critical_mode_active: active }).eq('id', userId);
   return { success: !error };
}
