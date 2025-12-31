import { createClient } from '@/lib/supabase/server'
import { Database, PlanType } from '@/types/database.types'
import { addMonths, startOfMonth } from 'date-fns'
import { FOOD_DB, getFoodById, FoodItem } from '@/lib/food-db'

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  'sedentary': 1.2,
  'light': 1.375,
  'moderate': 1.55,
  'active': 1.725,
  'very_active': 1.9
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

function getRandomFood(categoryList: string[], fallbackId: string, allowedIds?: string[]): FoodItem {
    // Filter by allowedIds if provided (e.g. for Breakfast carbs)
    let candidates = categoryList || []
    if (allowedIds) {
        candidates = candidates.filter(id => allowedIds.includes(id))
    }
    
    if (!candidates || candidates.length === 0) return getFoodById(fallbackId)!
    
    const id = candidates[Math.floor(Math.random() * candidates.length)]
    return getFoodById(id) || getFoodById(fallbackId)!
}

function calculatePortion(targetCals: number, food: FoodItem, forceMaxUnits?: number): { name: string, qty: string, cal: number, rawQty: number, unit: string, category: string, protein: number, carbs: number, fat: number } {
    let units = 0
    let protein = 0
    let carbs = 0
    let fat = 0
    
    // Alface e folhas à vontade
    if (['lettuce', 'spinach', 'arugula', 'kale'].includes(food.id)) {
        return {
            name: food.label,
            qty: 'À vontade',
            cal: 15,
            rawQty: 1,
            unit: 'unidade',
            category: food.category,
            protein: 1,
            carbs: 2,
            fat: 0
        }
    }

    if (food.unit === 'unidade' || food.unit === 'fatia' || food.unit === 'colher') {
        // Round to nearest integer for units, minimum 1
        units = Math.max(1, Math.round((targetCals / food.calories))) 
        
        // Strict limits per meal
        if (forceMaxUnits) {
             units = Math.min(units, forceMaxUnits)
        } else {
             if (food.category === 'fruit' && units > 1) units = 1 // Default max 1 fruit per meal if not specified
             if (food.id === 'bread' && units > 2) units = 2
             if (food.id === 'eggs' && units > 4) units = 4
        }

        protein = units * food.protein
        carbs = units * food.carbs
        fat = units * food.fat
        
        return {
            name: food.label,
            qty: `${units} ${food.unit}(s)`,
            cal: Math.round(units * food.calories),
            rawQty: units,
            unit: food.unit,
            category: food.category,
            protein: Number(protein.toFixed(1)),
            carbs: Number(carbs.toFixed(1)),
            fat: Number(fat.toFixed(1))
        }
    } else {
        // Grams - Round to nearest 10g
        let grams = Math.round((targetCals / food.calories) * 100 / 10) * 10
        if (grams < 50 && food.category !== 'fat') grams = 50 // Minimum portion

        protein = (grams / 100) * food.protein
        carbs = (grams / 100) * food.carbs
        fat = (grams / 100) * food.fat

        return {
            name: food.label,
            qty: `${grams}g`,
            cal: Math.round((grams / 100) * food.calories),
            rawQty: grams,
            unit: 'g',
            category: food.category,
            protein: Number(protein.toFixed(1)),
            carbs: Number(carbs.toFixed(1)),
            fat: Number(fat.toFixed(1))
        }
    }
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
  
  const foodPrefs = prefs?.food_preferences || {}
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
        bottles_count: bottlesCount,
        tmb: tmb,
        tdee: tdee
      }
    })
    .select()
    .single()

  if (snapError) throw snapError

  // 6. Generate Meals (Strict Logic)
  // Distribution: Breakfast 25%, Lunch 35%, Snack 15%, Dinner 25%
  const mealsConfig = [
    { name: 'Café da Manhã', order: 1, time: '08:00', ratio: 0.25 },
    { name: 'Almoço', order: 2, time: '12:00', ratio: 0.35 },
    { name: 'Lanche da Tarde', order: 3, time: '16:00', ratio: 0.15 },
    { name: 'Jantar', order: 4, time: '20:00', ratio: 0.25 }
  ]

  // Track daily fruit count
  let dailyFruitCount = 0

  for (const m of mealsConfig) {
    const mealCals = Math.round(targetCalories * m.ratio)
    
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
      const itemsToInsert = []

      // --- BREAKFAST ---
      if (m.name.includes('Café')) {
        // Rules: Bread OR Sweet Potato + Protein. Fruit Optional (max 1).
        // 60% Carb/Fruit, 40% Protein
        
        let proteinCals = mealCals * 0.4
        let carbCals = mealCals * 0.6
        
        // Protein: Eggs or Cheese (fallback Eggs)
        const proteinFood = getRandomFood(foodPrefs.proteins, 'eggs')
        const proteinItem = calculatePortion(proteinCals, proteinFood)
        itemsToInsert.push(proteinItem)
        
        // Carb: Bread, Tapioca, Cuscuz, Sweet Potato
        const allowedCarbs = ['bread', 'sliced_bread', 'tapioca', 'cuscuz', 'sweet_potato']
        const carbFood = getRandomFood(foodPrefs.carbs, 'bread', allowedCarbs)
        
        // Check if we can add fruit
        let fruitItem = null
        if (!foodPrefs.no_fruits && dailyFruitCount < 2) {
             // 1 Fruit unit
             const fruitFood = getRandomFood(foodPrefs.fruits, 'banana')
             fruitItem = calculatePortion(80, fruitFood, 1) // ~80kcal for 1 fruit
             dailyFruitCount++
             carbCals -= fruitItem.cal
        }

        const carbItem = calculatePortion(carbCals, carbFood)
        itemsToInsert.push(carbItem)
        if (fruitItem) itemsToInsert.push(fruitItem)
      }

      // --- LUNCH ---
      else if (m.name.includes('Almoço')) {
        // Rules: Rice + Beans + Protein + Salad. No Bread.
        // 35% Protein, 45% Carb (Rice+Beans), 20% Veg/Free
        
        // Prioritize Protein
        const proteinCals = mealCals * 0.40
        const proteinFood = getRandomFood(foodPrefs.proteins, 'chicken')
        itemsToInsert.push(calculatePortion(proteinCals, proteinFood))

        // Beans Logic
        let remainingCals = mealCals - itemsToInsert[0].cal
        
        if (foodPrefs.carbs?.includes('beans')) {
            const beansCals = remainingCals * 0.4 // 40% of remaining for beans
            const beansFood = getFoodById('beans')!
            itemsToInsert.push(calculatePortion(beansCals, beansFood))
            remainingCals -= itemsToInsert[itemsToInsert.length-1].cal
        }
        
        // Rice/Other Carb (No bread)
        const allowedCarbs = ['rice_white', 'rice_brown', 'potato', 'sweet_potato', 'pasta', 'cassava']
        const carbFood = getRandomFood(foodPrefs.carbs, 'rice_white', allowedCarbs)
        // Use remaining cals for main carb
        itemsToInsert.push(calculatePortion(remainingCals * 0.8, carbFood)) // Leave 20% for veg margin

        // Veggies / Salad (Tomato allowed)
        if (!foodPrefs.no_veggies) {
            const vegFood = getRandomFood(foodPrefs.veggies, 'lettuce') // Lettuce is free
            itemsToInsert.push(calculatePortion(20, vegFood)) // Minimal cals
            
            // Add Tomato if selected
            if (foodPrefs.veggies?.includes('tomato')) {
                 const tomato = getFoodById('tomato')!
                 itemsToInsert.push(calculatePortion(20, tomato, 1))
            }
        }
      }

      // --- SNACK ---
      else if (m.name.includes('Lanche')) {
        // Rules: Protein + Good Carb. Fruit max 1 if needed.
        // 50% Protein, 50% Carb
        
        let proteinCals = mealCals * 0.5
        let carbCals = mealCals * 0.5

        const proteinFood = getRandomFood(foodPrefs.proteins, 'eggs') 
        itemsToInsert.push(calculatePortion(proteinCals, proteinFood))

        // Fruit logic
        let fruitItem = null
        if (!foodPrefs.no_fruits && dailyFruitCount < 2) {
             const fruitFood = getRandomFood(foodPrefs.fruits, 'apple')
             fruitItem = calculatePortion(70, fruitFood, 1)
             dailyFruitCount++
             carbCals -= fruitItem.cal
        }
        
        // Good Carb
        const allowedCarbs = ['sweet_potato', 'bread', 'sliced_bread', 'tapioca']
        const carbFood = getRandomFood(foodPrefs.carbs, 'sweet_potato', allowedCarbs)
        itemsToInsert.push(calculatePortion(carbCals, carbFood))
        
        if (fruitItem) itemsToInsert.push(fruitItem)
      }

      // --- DINNER ---
      else if (m.name.includes('Jantar')) {
         // Same as lunch but lighter. 
         // 40% Protein, 40% Carb, 20% Veg.
         
         const proteinCals = mealCals * 0.45 // High protein
         const proteinFood = getRandomFood(foodPrefs.proteins, 'meat')
         itemsToInsert.push(calculatePortion(proteinCals, proteinFood))

         let remainingCals = mealCals - itemsToInsert[0].cal

         if (foodPrefs.carbs?.includes('beans')) {
             const beansCals = remainingCals * 0.3
             const beansFood = getFoodById('beans')!
             itemsToInsert.push(calculatePortion(beansCals, beansFood))
             remainingCals -= itemsToInsert[itemsToInsert.length-1].cal
         }

         const allowedCarbs = ['rice_white', 'rice_brown', 'potato', 'sweet_potato', 'cassava'] // Pasta maybe heavy for dinner? Let's keep it allowing user choice
         const carbFood = getRandomFood(foodPrefs.carbs, 'potato', allowedCarbs)
         itemsToInsert.push(calculatePortion(remainingCals * 0.8, carbFood))

         if (!foodPrefs.no_veggies) {
             const vegFood = getRandomFood(foodPrefs.veggies, 'broccoli')
             itemsToInsert.push(calculatePortion(30, vegFood))
         }
      }

      // Insert Items
      for (const item of itemsToInsert) {
        await supabase.from('snapshot_items').insert({
          snapshot_meal_id: mealData.id,
          name: item.name,
          quantity: item.qty,
          calories: item.cal,
          category: item.category,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat
        })
      }
    }
  }

  // 7. Log Regeneration
  await supabase.from('diet_regenerations').insert({ user_id: userId })

  return snapshot
}
