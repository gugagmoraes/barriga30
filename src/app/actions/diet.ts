'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateDietForUser } from '@/services/diet.service'
import { revalidatePath } from 'next/cache'

type RegenerateInput = {
  weight: number
  height: number
  age: number
}

export async function saveDietPreferences(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const selectedProteins = JSON.parse(formData.get('selected_proteins') as string || '[]')
        const selectedCarbs = JSON.parse(formData.get('selected_carbs') as string || '[]')
        const selectedVeggies = JSON.parse(formData.get('selected_veggies') as string || '[]')
        const selectedFruits = JSON.parse(formData.get('selected_fruits') as string || '[]')
        const noVeggies = formData.get('no_veggies') === 'true'
        const noFruits = formData.get('no_fruits') === 'true'

        const preferences = {
            user_id: user.id,
            age: Number(formData.get('age')),
            gender: formData.get('gender') as string,
            weight: Number(formData.get('weight')),
            height: Number(formData.get('height')),
            workout_frequency: formData.get('workout_frequency') as string,
            workout_duration: formData.get('workout_duration') as string,
            food_preferences: {
                proteins: selectedProteins,
                carbs: selectedCarbs,
                veggies: selectedVeggies,
                fruits: selectedFruits,
                no_veggies: noVeggies,
                no_fruits: noFruits
            },
            water_bottle_size_ml: Number(formData.get('water_bottle_size_ml'))
        }

        console.log('[saveDietPreferences] Starting preference save for user:', user.id)

        const supabaseAdmin = createAdminClient()
        if (!supabaseAdmin) {
            throw new Error('Supabase Admin Client not configured (missing env keys)')
        }

        const userEmail = user.email ?? null
        const meta = (user.user_metadata || {}) as any
        const userName =
            meta.full_name ||
            meta.name ||
            (typeof userEmail === 'string' ? userEmail.split('@')[0] : null) ||
            'Usuário'

        // Check if user exists by ID first
        const { data: existingUserById } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single()

        if (existingUserById) {
            // User exists by ID, just update fields if needed
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({
                    email: userEmail,
                    name: userName
                })
                .eq('id', user.id)
            
            if (updateError) throw new Error(`Failed to update existing user: ${updateError.message}`)
        } else {
            // User doesn't exist by ID. 
            // Check if email exists (edge case where ID is different but email is same - shouldn't happen in standard Supabase Auth but good to handle)
            // However, Supabase Auth user.id SHOULD match public.users.id.
            // If we get here, it means no row in public.users for this ID.
            
            // Try insert. If email conflict happens, it means we have a row with this email but DIFFERENT ID?
            // That would be a data integrity issue.
            // Assuming standard flow: ID is the key.
            
            // We use upsert with onConflict: 'id' as before, but let's handle the email constraint.
            // If email is unique and we try to insert a new ID with existing email, it fails.
            
            // Let's first check if there's ANY user with this email
            if (userEmail) {
                 const { data: existingUserByEmail } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('email', userEmail)
                    .single()
                 
                 if (existingUserByEmail && existingUserByEmail.id !== user.id) {
                     // CRITICAL: Found user with same email but different ID.
                     // We cannot insert/update this user without violating unique constraint.
                     // Log error and maybe fail gracefully or try to link?
                     console.error(`[saveDietPreferences] Critical: Email ${userEmail} already exists for user ${existingUserByEmail.id}, but current user is ${user.id}`)
                     // Fallback: Do NOT update email for this user to avoid crash, just update other fields?
                     // Or just insert without email?
                     // Let's try to update the OLD user to remove email? No, that's dangerous.
                     
                     // Decision: Proceed with insert/upsert but EXCLUDE email if it conflicts? 
                     // Or just throw clear error?
                     // Better approach for now: Do not attempt to write to 'users' table if we detect this conflict, 
                     // OR just update the existing user record associated with the email to point to the new ID? (Not possible, ID is PK)
                     
                     // Simplest fix for "duplicate key value violates unique constraint users_email_key":
                     // If we are trying to UPSERT by ID, and the Email matches another row, it fails.
                     
                     // We will try to find the user by ID. If found, update.
                     // If not found, insert. 
                 }
            }

            const { error: ensureUserError } = await supabaseAdmin
            .from('users')
            .upsert(
                {
                    id: user.id,
                    email: userEmail,
                    name: userName,
                } as any,
                { onConflict: 'id', ignoreDuplicates: false } 
            )

             // If error is strictly email constraint, try updating without email
             if (ensureUserError && ensureUserError.message.includes('users_email_key')) {
                 console.warn('[saveDietPreferences] Email conflict detected, retrying without email update...')
                  const { error: retryError } = await supabaseAdmin
                    .from('users')
                    .upsert(
                        {
                            id: user.id,
                            name: userName,
                            // Do not send email
                        } as any,
                        { onConflict: 'id' }
                    )
                 if (retryError) throw new Error(`Failed to ensure user (retry): ${retryError.message}`)
             } else if (ensureUserError) {
                 throw new Error(`Failed to ensure public.users row: ${ensureUserError.message}`)
             }
        }

        // Archive old active preferences
        const { error: archiveError } = await supabaseAdmin
            .from('diet_preferences')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('is_active', true)
        
        if (archiveError) console.error('[saveDietPreferences] Archive error:', archiveError)

        // Insert new preferences (active by default)
        const { error } = await supabaseAdmin
            .from('diet_preferences')
            .insert({
                ...preferences,
                is_active: true
            })

        if (error) {
             console.error('[saveDietPreferences] Insert error:', error)
             throw error
        }

        // Update User Profile basics as well to keep in sync
        const { error: userError } = await supabaseAdmin.from('users').update({
            weight: preferences.weight,
            height: preferences.height,
            age: preferences.age,
            gender: preferences.gender
        }).eq('id', user.id)

        if (userError) {
            console.error('[saveDietPreferences] User update error (Admin):', userError)
            throw new Error(`Failed to update user profile: ${userError.message}`)
        } else {
            console.log('[saveDietPreferences] User profile updated successfully via Admin')
        }

        // Generate Diet Immediately
        console.log('[saveDietPreferences] Triggering diet generation...')
        await generateDietForUser(user.id)
        console.log('[saveDietPreferences] Diet generation complete.')

        revalidatePath('/dieta')
        revalidatePath('/lista-compras')
        return { success: true }
    } catch (e: any) {
        console.error('[saveDietPreferences] Failed to save preferences:', e)
        return { success: false, error: e.message || String(e) }
    }
}

export async function regenerateDietAction(input: RegenerateInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    // 1. Update User Biometrics
    const { error: updateError } = await supabase
        .from('users')
        .update({
            weight: input.weight,
            height: input.height,
            age: input.age
        })
        .eq('id', user.id)

    // Also update preferences if they exist
    await supabase.from('diet_preferences').update({
        weight: input.weight,
        height: input.height,
        age: input.age
    }).eq('user_id', user.id)

    if (updateError) throw new Error('Failed to update profile')

    // 2. Generate New Diet Snapshot
    // The service handles limits check internally
    await generateDietForUser(user.id)

    revalidatePath('/dieta')
    revalidatePath('/lista-compras')
    return { success: true }

  } catch (e: any) {
    console.error('Regeneration failed:', e)
    // Extract message if it's a known error (like limit reached)
    return { success: false, error: e.message || 'Failed to regenerate diet' }
  }
}
