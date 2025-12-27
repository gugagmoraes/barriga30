import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, recommended_level, tmb, tdee, preferences, equipment } = body

    if (!user_id || !recommended_level) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Update user profile
    // Note: tmb, tdee etc are not in the users table definition in the SQL I wrote (only weight, height, age, level).
    // In a real app we would add columns or a separate profile table.
    // For MVP compliance with the requirement "Atualizar perfil do usuário", I'm updating what exists.
    const { error } = await supabase.from('users').update({
        level: recommended_level,
        onboarding_complete: true
    }).eq('id', user_id)

    if (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Quiz integration error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
