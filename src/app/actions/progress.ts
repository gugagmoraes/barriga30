'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addWeightRecord(weight: number, date?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const { error } = await supabase.from('weight_records').insert({
            user_id: user.id,
            weight: weight,
            recorded_at: date ? new Date(date).toISOString() : new Date().toISOString()
        })

        if (error) throw error

        // Also update current weight in user profile
        await supabase.from('users').update({ weight }).eq('id', user.id)

        revalidatePath('/progresso')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (e: any) {
        console.error('Weight save error:', e)
        return { success: false, error: e.message || 'Failed to save weight' }
    }
}

export async function addMeasurements(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const { error } = await supabase.from('measurements').insert({
            user_id: user.id,
            ...data
        })
        
        if (error) throw error
        
        revalidatePath('/progresso')
        return { success: true }
    } catch (e: any) {
        console.error('Measurements save error:', e)
        return { success: false, error: e.message || 'Failed to save measurements' }
    }
}

export async function uploadProgressPhoto(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    let dataUrl = ''

    // Check if we received base64 string directly (from client-side processing)
    const photoBase64 = formData.get('photo_base64') as string
    if (photoBase64) {
        dataUrl = photoBase64
    } else {
        // Fallback to File object processing (might hit size limits on server actions)
        const photo = formData.get('photo') as File
        if (!photo) return { success: false, error: 'No photo provided' }
        
        try {
            const buffer = await photo.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            dataUrl = `data:${photo.type};base64,${base64}`
        } catch (e) {
            return { success: false, error: 'Failed to process file on server' }
        }
    }

    try {
        const { error } = await supabase.from('progress_photos').insert({
            user_id: user.id,
            photo_data: dataUrl,
            notes: formData.get('notes') as string
        })

        if (error) throw error

        revalidatePath('/progresso')
        return { success: true }
    } catch (e: any) {
        console.error('Photo upload error:', e)
        return { success: false, error: e.message || 'Failed to upload photo' }
    }
}
