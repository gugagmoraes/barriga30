'use server'

import { revalidatePath } from 'next/cache'
import { generateDietForUser } from '@/services/diet.service'

export async function generateInitialDiet(userId: string) {
  await generateDietForUser(userId)
  revalidatePath('/dieta')
}
