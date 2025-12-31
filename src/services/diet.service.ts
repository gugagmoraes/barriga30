import { createClient } from '@/lib/supabase/server'
import { PlanType } from '@/types/database.types'
import { startOfMonth } from 'date-fns'
import { getFoodById, FoodItem } from '@/lib/food-db'

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
}

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

function getRandomFood(categoryList: string[], fallbackId: string, allowedIds?: string[]): FoodItem {
  let candidates = categoryList || []
  if (allowedIds) candidates = candidates.filter(id => allowedIds.includes(id))
  if (!candidates || candidates.length === 0) return getFoodById(fallbackId)!
  const id = candidates[Math.floor(Math.random() * candidates.length)]
  return getFoodById(id) || getFoodById(fallbackId)!
}

function calculatePortion(targetCals: number, food: FoodItem, forceMaxUnits?: number) {
  if (['lettuce', 'spinach', 'arugula', 'kale'].includes(food.id)) {
    return { name: food.label, qty: 'À vontade', cal: 15, rawQty: 1, unit: 'unidade', category: food.category, protein: 1, carbs: 2, fat: 0 }
  }
  if (food.unit === 'unidade' || food.unit === 'fatia' || food.unit === 'colher') {
    let units = Math.max(1, Math.round((targetCals / food.calories)))
    if (forceMaxUnits) units = Math.min(units, forceMaxUnits)
    else {
      if (food.category === 'fruit' && units > 1) units = 1
      if (food.id === 'bread' && units > 1) units = 1
      if (food.id === 'eggs' && units > 4) units = 4
    }
    const protein = Number((units * food.protein).toFixed(1))
    const carbs = Number((units * food.carbs).toFixed(1))
    const fat = Number((units * food.fat).toFixed(1))
    return { name: food.label, qty: `${units} ${food.unit}(s)`, cal: Math.round(units * food.calories), rawQty: units, unit: food.unit, category: food.category, protein, carbs, fat }
  }
  let grams = Math.round((targetCals / food.calories) * 100 / 10) * 10
  if (grams < 50 && food.category !== 'fat') grams = 50
  const protein = Number(((grams / 100) * food.protein).toFixed(1))
  const carbs = Number(((grams / 100) * food.carbs).toFixed(1))
  const fat = Number(((grams / 100) * food.fat).toFixed(1))
  return { name: food.label, qty: `${grams}g`, cal: Math.round((grams / 100) * food.calories), rawQty: grams, unit: 'g', category: food.category, protein, carbs, fat }
}

export async function checkDietRegenerationLimit(userId: string, planType: PlanType) {
  const supabase = await createClient()
  if (planType === 'vip') return { allowed: true }
  if (planType === 'basic') {
    const { count, error } = await supabase.from('diet_regenerations').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    if (error) throw error
    if (count && count > 0) return { allowed: false, reason: 'Plano Básico permite apenas uma geração de dieta.' }
    return { allowed: true }
  }
  if (planType === 'plus') {
    const start = startOfMonth(new Date()).toISOString()
    const { count, error } = await supabase.from('diet_regenerations').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', start)
    if (error) throw error
    if (count && count >= 2) return { allowed: false, reason: 'Plano Plus permite atualizar a dieta 2 vezes por mês.' }
    return { allowed: true }
  }
  return { allowed: false, reason: 'Plano desconhecido.' }
}

async function isDietValid(snapshot: any, foodPrefs: any) {
  const hasRice = (name: string) => name.toLowerCase().includes('arroz')
  const hasBeans = (name: string) => name.toLowerCase().includes('feij')
  const hasBread = (name: string) => name.toLowerCase().includes('pão') || name.toLowerCase().includes('forma')
  const hasSweetPotato = (name: string) => name.toLowerCase().includes('batata doce')
  let fruitCount = 0
  for (const meal of snapshot.snapshot_meals) {
    const items = meal.snapshot_items
    if (meal.name.includes('Almoço') || meal.name.includes('Jantar')) {
      const names = items.map((i: any) => i.name)
      const ricePresent = names.some(hasRice)
      const beansPresent = names.some(hasBeans)
      if (foodPrefs.carbs?.includes('rice_white') || foodPrefs.carbs?.includes('rice_brown')) { if (!ricePresent) return false }
      if (foodPrefs.carbs?.includes('beans')) { if (!beansPresent) return false }
      if (beansPresent && !ricePresent) return false
      if (names.some(hasBread)) return false
      if (names.some(hasSweetPotato)) return false
      if (items.some((i: any) => i.category === 'fruit')) return false
    }
    if (meal.name.includes('Café')) {
      const hasProtein = items.some((i: any) => i.category === 'protein')
      if (!hasProtein) return false
      const carbItems = items.filter((i: any) => i.category === 'carb')
      if (carbItems.length < 1) return false
      const allowed = carbItems.every((i: any) => hasBread(i.name) || hasSweetPotato(i.name))
      if (!allowed) return false
    }
    if (meal.name.includes('Lanche')) {
      const hasProtein = items.some((i: any) => i.category === 'protein')
      if (!hasProtein) return false
      const carbItems = items.filter((i: any) => i.category === 'carb')
      const allowed = carbItems.every((i: any) => hasBread(i.name) || hasSweetPotato(i.name))
      if (!allowed) return false
    }
    fruitCount += items.filter((i: any) => i.category === 'fruit').length
  }
  if (fruitCount > 2) return false
  return true
}

async function persistShoppingLists(userId: string, snapshot: any) {
  const supabase = await createClient()
  const aggregated: Record<string, { total: number, unit: string }> = {}
  for (const meal of snapshot.snapshot_meals) {
    for (const item of meal.snapshot_items) {
      const name = item.name
      const qtyStr = item.quantity as string
      let val = 0
      let unit = ''
      const m = qtyStr.match(/^([\d\.]+)\s*(.+)$/)
      if (m) { val = parseFloat(m[1]); unit = m[2] } else { val = 1; unit = 'unidade' }
      const key = `${name}::${unit}`
      if (!aggregated[key]) aggregated[key] = { total: 0, unit }
      aggregated[key].total += val
    }
  }
  const weeklyItems = Object.entries(aggregated).map(([key, data]) => { const [name] = key.split('::'); const qty = Math.ceil(data.total * 7); return { name, unit: data.unit, quantity: qty } })
  const monthlyItems = Object.entries(aggregated).map(([key, data]) => { const [name] = key.split('::'); const qty = Math.ceil(data.total * 30); return { name, unit: data.unit, quantity: qty } })
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startIso = start.toISOString().slice(0, 10)
  const endWeek = new Date(start.getTime() + 6 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  const endMonth = new Date(start.getTime() + 29 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  const { data: weekly } = await supabase.from('shopping_lists').insert({ user_id: userId, period: 'weekly', start_date: startIso, end_date: endWeek, diet_snapshot_id: snapshot.id }).select().single()
  if (weekly) { for (const it of weeklyItems) { await supabase.from('shopping_list_items').insert({ shopping_list_id: weekly.id, name: it.name, unit: it.unit, quantity: it.quantity }) } }
  const { data: monthly } = await supabase.from('shopping_lists').insert({ user_id: userId, period: 'monthly', start_date: startIso, end_date: endMonth, diet_snapshot_id: snapshot.id }).select().single()
  if (monthly) { for (const it of monthlyItems) { await supabase.from('shopping_list_items').insert({ shopping_list_id: monthly.id, name: it.name, unit: it.unit, quantity: it.quantity }) } }
}

export async function generateDietForUser(userId: string) {
  const supabase = await createClient()
  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
  const { data: prefs } = await supabase.from('diet_preferences').select('*').eq('user_id', userId).single()
  if (!user) throw new Error('User not found')
  const limitCheck = await checkDietRegenerationLimit(userId, user.plan_type)
  if (!limitCheck.allowed) throw new Error(limitCheck.reason || 'Not allowed')
  const weight = prefs?.weight || user.weight || 70
  const height = prefs?.height || user.height || 165
  const age = prefs?.age || user.age || 30
  const gender = prefs?.gender || user.gender || 'female'
  const activity = 'moderate'
  const foodPrefs = prefs?.food_preferences || {}
  const bottleSize = prefs?.water_bottle_size_ml || 500
  const tmb = calculateTMB(weight, height, age, gender)
  const tdee = calculateTDEE(tmb, activity)
  const targetCalories = Math.max(1200, tdee - 500)
  const waterTargetMl = Math.round(weight * 35)
  const bottlesCount = Math.ceil(waterTargetMl / bottleSize)
  await supabase.from('diet_snapshots').update({ is_active: false }).eq('user_id', userId)
  const { data: snapshot } = await supabase.from('diet_snapshots').insert({ user_id: userId, daily_calories: targetCalories, name: `Plano Personalizado (${targetCalories} kcal)`, origin: 'ai_generated', is_active: true, macros: { protein: Math.round(targetCalories * 0.3 / 4), carbs: Math.round(targetCalories * 0.4 / 4), fat: Math.round(targetCalories * 0.3 / 9), water_target_ml: waterTargetMl, water_bottle_size: bottleSize, bottles_count: bottlesCount, tmb, tdee } }).select().single()
  if (!snapshot) throw new Error('Failed to create snapshot')
  const mealsConfig = [
    { name: 'Café da Manhã', order: 1, time: '08:00', ratio: 0.25 },
    { name: 'Almoço', order: 2, time: '12:00', ratio: 0.35 },
    { name: 'Lanche da Tarde', order: 3, time: '16:00', ratio: 0.15 },
    { name: 'Jantar', order: 4, time: '20:00', ratio: 0.25 }
  ]
  let dailyFruitCount = 0
  let lunchProteinFoodRef: FoodItem | null = null
  let lunchCarbFoodRef: FoodItem | null = null
  let lunchBeansUsed = false
  let lunchProteinCal = 0
  let lunchCarbCal = 0
  let lunchBeansCal = 0
  for (const m of mealsConfig) {
    const mealCals = Math.round(targetCalories * m.ratio)
    const { data: mealData } = await supabase.from('snapshot_meals').insert({ diet_snapshot_id: snapshot.id, name: m.name, order_index: m.order, time_of_day: m.time }).select().single()
    if (!mealData) continue
    const itemsToInsert: any[] = []
    if (m.name.includes('Café')) {
      let pCals = Math.round(mealCals * 0.4)
      let cCals = mealCals - pCals
      const pFood = getRandomFood(foodPrefs.proteins, 'eggs')
      const pItem = calculatePortion(pCals, pFood, pFood.id === 'eggs' ? 4 : undefined)
      itemsToInsert.push(pItem)
      let fruitItem: any = null
      if (!foodPrefs.no_fruits && dailyFruitCount < 2) {
        const fFood = getRandomFood(foodPrefs.fruits, 'banana')
        fruitItem = calculatePortion(80, fFood, 1)
        dailyFruitCount++
        cCals -= fruitItem.cal
      }
      let carbFood = getFoodById('bread')!
      if (foodPrefs.carbs?.includes('sweet_potato')) carbFood = getFoodById('sweet_potato')!
      else if (foodPrefs.carbs?.includes('bread') || foodPrefs.carbs?.includes('sliced_bread')) carbFood = getRandomFood(foodPrefs.carbs, 'bread', ['bread','sliced_bread'])
      const cItem = calculatePortion(cCals, carbFood, carbFood.id === 'bread' ? 1 : undefined)
      itemsToInsert.push(cItem)
      if (fruitItem) itemsToInsert.push(fruitItem)
    } else if (m.name.includes('Almoço')) {
      const pCals = Math.round(mealCals * 0.4)
      const pFood = getRandomFood(foodPrefs.proteins, 'chicken')
      const pItem = calculatePortion(pCals, pFood)
      itemsToInsert.push(pItem)
      lunchProteinFoodRef = pFood
      lunchProteinCal = pItem.cal
      let remaining = mealCals - pItem.cal
      if (foodPrefs.carbs?.includes('beans')) {
        const bCals = Math.round(remaining * 0.35)
        const bFood = getFoodById('beans')!
        const bItem = calculatePortion(bCals, bFood)
        itemsToInsert.push(bItem)
        lunchBeansUsed = true
        lunchBeansCal = bItem.cal
        remaining -= bItem.cal
      }
      let carbFood = getFoodById('rice_white')!
      if (foodPrefs.carbs?.includes('rice_white') || foodPrefs.carbs?.includes('rice_brown')) carbFood = getRandomFood(foodPrefs.carbs, 'rice_white', ['rice_white','rice_brown'])
      const cItem = calculatePortion(Math.round(remaining * 0.9), carbFood)
      itemsToInsert.push(cItem)
      lunchCarbFoodRef = carbFood
      lunchCarbCal = cItem.cal
      if (!foodPrefs.no_veggies) {
        const vegFood = getFoodById('lettuce')!
        itemsToInsert.push(calculatePortion(15, vegFood))
        if (foodPrefs.veggies?.includes('tomato')) itemsToInsert.push(calculatePortion(20, getFoodById('tomato')!, 1))
      }
    } else if (m.name.includes('Lanche')) {
      const pCals = Math.round(mealCals * 0.5)
      const cCals = mealCals - pCals
      const pFood = getRandomFood(foodPrefs.proteins, 'eggs')
      itemsToInsert.push(calculatePortion(pCals, pFood, 4))
      let fruitItem: any = null
      let carbBudget = cCals
      if (!foodPrefs.no_fruits && dailyFruitCount < 2) {
        const fFood = getRandomFood(foodPrefs.fruits, 'apple')
        fruitItem = calculatePortion(70, fFood, 1)
        dailyFruitCount++
        carbBudget -= fruitItem.cal
      }
      let carbFood = getFoodById('sweet_potato')!
      if (!foodPrefs.carbs?.includes('sweet_potato')) carbFood = getRandomFood(foodPrefs.carbs, 'bread', ['bread','sliced_bread','tapioca','cuscuz'])
      itemsToInsert.push(calculatePortion(carbBudget, carbFood, carbFood.id === 'bread' ? 1 : undefined))
      if (fruitItem) itemsToInsert.push(fruitItem)
    } else if (m.name.includes('Jantar')) {
      const pFood = lunchProteinFoodRef || getRandomFood(foodPrefs.proteins, 'meat')
      const pCals = Math.round(lunchProteinCal * 0.9)
      itemsToInsert.push(calculatePortion(pCals, pFood))
      if (lunchBeansUsed) {
        const bFood = getFoodById('beans')!
        const bCals = Math.round(lunchBeansCal * 0.8)
        itemsToInsert.push(calculatePortion(bCals, bFood))
      }
      const carbFood = lunchCarbFoodRef || getFoodById('rice_white')!
      const cCals = Math.round(lunchCarbCal * 0.8)
      itemsToInsert.push(calculatePortion(cCals, carbFood))
      if (!foodPrefs.no_veggies) {
        const vegFood = getFoodById('broccoli')!
        itemsToInsert.push(calculatePortion(30, vegFood))
      }
    }
    for (const it of itemsToInsert) {
      await supabase.from('snapshot_items').insert({ snapshot_meal_id: mealData.id, name: it.name, quantity: it.qty, calories: it.cal, category: it.category, protein: it.protein, carbs: it.carbs, fat: it.fat })
    }
  }
  const { data: fullSnapshot } = await supabase.from('diet_snapshots').select('*, snapshot_meals(*, snapshot_items(*))').eq('id', snapshot.id).single()
  let attempts = 0
  while (attempts < 3) {
    if (fullSnapshot && await isDietValid(fullSnapshot, foodPrefs)) break
    await supabase.from('snapshot_items').delete().in('snapshot_meal_id', fullSnapshot?.snapshot_meals.map((m: any) => m.id) || [])
    await supabase.from('snapshot_meals').delete().eq('diet_snapshot_id', snapshot.id)
    await supabase.from('diet_snapshots').delete().eq('id', snapshot.id)
    attempts++
    const regen = await generateDietForUser(userId)
    return regen
  }
  await supabase.from('diet_regenerations').insert({ user_id: userId })
  if (fullSnapshot) await persistShoppingLists(userId, fullSnapshot)
  return fullSnapshot || snapshot
}

