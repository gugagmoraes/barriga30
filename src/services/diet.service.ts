import { createClient } from '@/lib/supabase/server'
import { Database, PlanType } from '@/types/database.types'
import { addMonths, startOfMonth } from 'date-fns'

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  'sedentary': 1.2,
  'light': 1.375,
  'moderate': 1.55,
  'active': 1.725,
  'very_active': 1.9
}

const FOOD_LABELS: Record<string, string> = {
    chicken: 'Frango Grelhado',
    meat: 'Carne Magra Moída',
    eggs: 'Ovos Cozidos/Mexidos',
    fish: 'Peixe Assado/Grelhado',
    rice: 'Arroz Branco/Integral',
    beans: 'Feijão',
    potato: 'Batata Cozida/Assada',
    pasta: 'Macarrão Integral',
    bread: 'Pão Francês',
    lettuce: 'Alface',
    tomato: 'Tomate',
    carrot: 'Cenoura Ralada',
    broccoli: 'Brócolis Cozido'
}

// Mifflin-St Jeor Equation
function calculateTMB(weight: number, height: number, age: number, gender: string): number {
  let tmb = (10 * weight) + (6.25 * height) - (5 * age)
  if (gender.toLowerCase().startsWith('m')) tmb += 5
  else tmb -= 161
  return Math.round(tmb)
}

function calculateTDEE(tmb: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2
  return Math.round(tmb * multiplier)
}

function getPreferredFood(category: 'proteins' | 'carbs' | 'veggies', preferences: any, defaultName: string) {
    const list = preferences?.[category]
    if (list && Array.isArray(list) && list.length > 0) {
        // Pick random
        const key = list[Math.floor(Math.random() * list.length)]
        return FOOD_LABELS[key] || defaultName
    }
    return defaultName
}

function getPortion(calories: number, category: 'protein' | 'carb' | 'fat' | 'veg', preferences: any): { name: string, quantity: string, cal: number } {
  const scale = calories / 2000; 
  
  if (category === 'protein') {
    const name = getPreferredFood('proteins', preferences, 'Frango Grelhado')
    return { name, quantity: `${Math.round(150 * scale)}g`, cal: Math.round(165 * scale) }
  }
  if (category === 'carb') {
    const name = getPreferredFood('carbs', preferences, 'Arroz Integral')
    return { name, quantity: `${Math.round(100 * scale)}g`, cal: Math.round(130 * scale) }
  }
  if (category === 'fat') {
    return { name: 'Azeite de Oliva ou Castanhas', quantity: '1 colher', cal: 120 }
  }
  if (category === 'veg') {
    const name = getPreferredFood('veggies', preferences, 'Legumes Variados')
    return { name, quantity: 'À vontade', cal: 50 }
  }
  return { name: 'Alimento', quantity: '1 porção', cal: 100 }
}

export async function checkDietRegenerationLimit(userId: string, planType: PlanType) {
  const supabase = await createClient()
  
  if (planType === 'vip') return { allowed: true }

  if (planType === 'basic') {
    const { count, error } = await supabase
      .from('diet_regenerations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error
    if (count && count > 0) return { allowed: false, reason: 'Plano Básico permite apenas uma geração de dieta.' }
    return { allowed: true }
  }

  if (planType === 'plus') {
    const start = startOfMonth(new Date()).toISOString()
    const { count, error } = await supabase
      .from('diet_regenerations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', start)

    if (error) throw error
    if (count && count >= 2) return { allowed: false, reason: 'Plano Plus permite atualizar a dieta 2 vezes por mês.' }
    return { allowed: true }
  }

  return { allowed: false, reason: 'Plano desconhecido.' }
}

export async function generateDietForUser(userId: string) {
  const supabase = await createClient()

  // 1. Get User Data & Preferences
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  const { data: prefs } = await supabase
    .from('diet_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (userError || !user) throw new Error('User not found')

  // 2. Check Limits
  const limitCheck = await checkDietRegenerationLimit(userId, user.plan_type)
  if (!limitCheck.allowed) throw new Error(limitCheck.reason)

  // 3. Calculate Calories
  const weight = prefs?.weight || user.weight || 70
  const height = prefs?.height || user.height || 165
  const age = prefs?.age || user.age || 30
  const gender = prefs?.gender || user.gender || 'female'
  const activity = 'moderate' 
  
  const foodPreferences = prefs?.food_preferences || {}
  const bottleSize = prefs?.water_bottle_size_ml || 500

  const tmb = calculateTMB(weight, height, age, gender)
  const tdee = calculateTDEE(tmb, activity)
  const targetCalories = Math.max(1200, tdee - 500) // Deficit 500

  // Water Calculation (35ml per kg)
  const waterTargetMl = Math.round(weight * 35)
  const bottlesCount = Math.ceil(waterTargetMl / bottleSize)

  // 4. Deactivate Old Snapshots
  await supabase
    .from('diet_snapshots')
    .update({ is_active: false })
    .eq('user_id', userId)

  // 5. Create New Snapshot
  const { data: snapshot, error: snapError } = await supabase
    .from('diet_snapshots')
    .insert({
      user_id: userId,
      daily_calories: targetCalories,
      name: `Plano Personalizado (${targetCalories} kcal)`,
      origin: 'ai_generated',
      is_active: true,
      macros: {
        protein: Math.round(targetCalories * 0.3 / 4),
        carbs: Math.round(targetCalories * 0.4 / 4),
        fat: Math.round(targetCalories * 0.3 / 9),
        water_target_ml: waterTargetMl,
        water_bottle_size: bottleSize,
        bottles_count: bottlesCount
      }
    })
    .select()
    .single()

  if (snapError) throw snapError

  // 6. Generate Meals (Structure)
  const meals = [
    { name: 'Café da Manhã', order: 1, time: '08:00' },
    { name: 'Almoço', order: 2, time: '12:00' },
    { name: 'Lanche da Tarde', order: 3, time: '16:00' },
    { name: 'Jantar', order: 4, time: '20:00' }
  ]

  for (const m of meals) {
    const { data: mealData } = await supabase
      .from('snapshot_meals')
      .insert({
        diet_snapshot_id: snapshot.id,
        name: m.name,
        order_index: m.order,
        time_of_day: m.time
      })
      .select()
      .single()

    if (mealData) {
      // Add Items based on Meal Type
      const items = []
      
      if (m.name.includes('Café')) {
        const pName = getPreferredFood('proteins', foodPreferences, 'Ovos')
        const cName = getPreferredFood('carbs', foodPreferences, 'Fruta')
        items.push({ name: pName, qty: '2 unidades/fatias', cal: 140, cat: 'protein' })
        items.push({ name: cName, qty: '1 porção média', cal: 60, cat: 'carb' })
        items.push({ name: 'Café/Chá sem açúcar', qty: '1 xícara', cal: 5, cat: 'other' })
      } else if (m.name.includes('Lanche')) {
         items.push({ name: 'Iogurte Natural ou Whey', qty: '1 porção', cal: 100, cat: 'protein' })
         items.push({ name: 'Castanhas ou Pasta de Amendoim', qty: '1 porção pequena', cal: 80, cat: 'fat' })
      } else {
         // Lunch/Dinner logic (Scaled)
         const p = getPortion(targetCalories, 'protein', foodPreferences)
         const c = getPortion(targetCalories, 'carb', foodPreferences)
         const v = getPortion(targetCalories, 'veg', foodPreferences)
         
         items.push({ name: p.name, qty: p.quantity, cal: p.cal, cat: 'protein' })
         if (m.name.includes('Almoço')) {
            items.push({ name: c.name, qty: c.quantity, cal: c.cal, cat: 'carb' })
         } else {
            // Dinner: lighter carb (just veg + protein usually, but adding small carb if needed)
            items.push({ name: 'Salada de Folhas Verdes', qty: 'À vontade', cal: 20, cat: 'veg' })
         }
         items.push({ name: v.name, qty: v.quantity, cal: v.cal, cat: 'veg' })
      }

      // Insert Items
      for (const item of items) {
        await supabase.from('snapshot_items').insert({
          snapshot_meal_id: mealData.id,
          name: item.name,
          quantity: item.qty,
          calories: item.cal,
          category: item.cat
        })
      }
    }
  }

  // 7. Log Regeneration
  await supabase.from('diet_regenerations').insert({ user_id: userId })

  return snapshot
}
