'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { generateDietForUser } from '@/services/diet.service'
import { PlanType } from '@/types/database.types'
import { redirect } from 'next/navigation'

// Basic schema validation for the submission
const submissionSchema = z.object({
  sessionId: z.string().optional(),
  status: z.enum(['started', 'in_progress', 'completed', 'abandoned']),
  responses: z.record(z.string(), z.any()), // JSONB
  version: z.string().default('v1.0')
})

export type SaveQuizInput = z.infer<typeof submissionSchema>

export async function saveQuizSubmission(data: SaveQuizInput) {
  const supabase = await createClient()
  
  // 1. Get current user if logged in
  const { data: { user } } = await supabase.auth.getUser()

  const validation = submissionSchema.safeParse(data)
  
  if (!validation.success) {
    return { error: 'Invalid submission data', details: (validation.error as any).errors }
  }

  const { sessionId, status, responses, version } = validation.data

  // 2. Save Submission
  const { data: submission, error } = await supabase
    .from('quiz_submissions')
    .insert({
      user_id: user?.id || null,
      session_id: sessionId,
      status,
      responses,
      version,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving quiz submission:', error)
    return { error: 'Failed to save quiz submission' }
  }

  // 3. If User is Logged In + Quiz Completed -> Update Profile & Generate Diet
  if (user && status === 'completed') {
    try {
      // Extract biometrics from responses
      const weight = Number(responses.weight)
      const height = Number(responses.height)
      const age = Number(responses.age)
      const gender = String(responses.gender)
      const objective = String(responses.objective)
      
      // Determine activity level from workoutFrequency
      const freq = String(responses.workoutFrequency || '')
      let activity_level = 'light'
      if (freq.includes('2x')) activity_level = 'sedentary'
      else if (freq.includes('3x')) activity_level = 'light'
      else if (freq.includes('4x')) activity_level = 'moderate'
      else if (freq.includes('5x')) activity_level = 'active'

      // Update User Profile
      await supabase.from('users').update({
        weight,
        height,
        age,
        gender,
        objective,
        activity_level,
        onboarding_complete: true
      }).eq('id', user.id)

      // Generate Initial Diet (If allowed)
      await generateDietForUser(user.id)
      
    } catch (e) {
      console.error('Error updating profile or generating diet:', e)
    }
  }

  return { success: true, id: submission.id }
}

export async function finalizeQuiz(plan: string, quizState: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  // 1. Update Plan
  const planType = (plan ? plan.toLowerCase() : 'basic') as PlanType
  await supabase.from('users').update({ plan_type: planType }).eq('id', user.id)

  // 2. Save Quiz
  await saveQuizSubmission({
    status: 'completed',
    responses: quizState,
    version: 'v1.0',
    sessionId: `finalize-${user.id}-${Date.now()}`
  })

  // 3. Redirect to Dashboard
  redirect('/dashboard')
}
