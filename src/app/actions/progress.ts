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

    // Prefer storage upload and persist public URL
    try {
        let mime = 'image/jpeg'
        let base64Payload = ''
        const photoBase64 = formData.get('photo_base64') as string
        if (photoBase64) {
            const match = photoBase64.match(/^data:(.+);base64,(.*)$/)
            if (!match) return { success: false, error: 'Invalid base64 data' }
            mime = match[1]
            base64Payload = match[2]
        } else {
            const photo = formData.get('photo') as File
            if (!photo) return { success: false, error: 'No photo provided' }
            mime = photo.type || 'image/jpeg'
            const buffer = await photo.arrayBuffer()
            base64Payload = Buffer.from(buffer).toString('base64')
        }

        const fileExt = mime.split('/')[1] || 'jpg'
        const filePath = `${user.id}/${Date.now()}.${fileExt}`
        const fileBuffer = Buffer.from(base64Payload, 'base64')

        const { error: uploadError } = await supabase.storage.from('progress-photos').upload(filePath, fileBuffer, {
            contentType: mime,
            upsert: true
        })

        if (uploadError) {
            return { success: false, error: uploadError.message || 'Failed to upload to storage' }
        }

        const { data: pub } = supabase.storage.from('progress-photos').getPublicUrl(filePath)
        const publicUrl = pub.publicUrl

        const { error: insertError } = await supabase.from('progress_photos').insert({
            user_id: user.id,
            photo_data: publicUrl,
            notes: formData.get('notes') as string
        })

        if (insertError) return { success: false, error: insertError.message || 'Failed to save photo record' }

        revalidatePath('/progresso')
        return { success: true }
    } catch (e: any) {
        console.error('Photo upload error:', e)
        return { success: false, error: e.message || 'Failed to upload photo' }
    }
}
