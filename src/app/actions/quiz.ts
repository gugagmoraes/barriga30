'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Basic schema validation for the submission
// We don't validate the CONTENTS of responses (JSONB), just the structure
const submissionSchema = z.object({
  sessionId: z.string().optional(),
  status: z.enum(['started', 'in_progress', 'completed', 'abandoned']),
  responses: z.record(z.string(), z.any()), // JSONB - Accepts any structure for now
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

  // 2. Insert or Update logic could go here. For now, simple insert.
  // In a real flow, we might want to UPSERT based on session_id if status is 'in_progress'
  
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

  return { success: true, id: submission.id }
}
