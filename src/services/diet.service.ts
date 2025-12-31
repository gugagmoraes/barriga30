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

function getRandomFood(categoryList: string[], fallbackId: string): FoodItem {
    if (!categoryList || categoryList.length === 0) return getFoodById(fallbackId)!
    const id = categoryList[Math.floor(Math.random() * categoryList.length)]
    return getFoodById(id) || getFoodById(fallbackId)!
}

function calculatePortion(targetCals: number, food: FoodItem): { name: string, qty: string, cal: number, rawQty: number, unit: string, category: string, protein: number, carbs: number, fat: number } {
    let units = 0
    let protein = 0
    let carbs = 0
    let fat = 0
    
    // Alface à vontade
    if (food.id === 'lettuce') {
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
        
        // Limit fruits/bread/eggs to reasonable max per meal if not main source
        if (food.category === 'fruit' && units > 2) units = 2
        if (food.id === 'bread' && units > 2) units = 2
        if (food.id === 'eggs' && units > 4) units = 4

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
        // 50% Carb, 30% Protein, 20% Fruit/Fat
        const carbCals = mealCals * 0.5
        const proteinCals = mealCals * 0.3
        const fruitCals = mealCals * 0.2

        // Carb: Prioritize Bread/Tapioca if selected, else any carb
        const breakfastCarbs = foodPrefs.carbs?.filter((id: string) => ['bread', 'sliced_bread', 'tapioca', 'cuscuz'].includes(id))
        const carbFood = getRandomFood(breakfastCarbs?.length ? breakfastCarbs : foodPrefs.carbs, 'bread')
        
        // Protein: Eggs or Cheese (Cheese not in DB yet, so Eggs/Chicken fallback)
        const proteinFood = getRandomFood(foodPrefs.proteins, 'eggs')

        itemsToInsert.push(calculatePortion(carbCals, carbFood))
        itemsToInsert.push(calculatePortion(proteinCals, proteinFood))

        if (!foodPrefs.no_fruits) {
            const fruitFood = getRandomFood(foodPrefs.fruits, 'banana')
            itemsToInsert.push(calculatePortion(fruitCals, fruitFood))
        } else {
             // Redistribute fruit cals to carb
             itemsToInsert[0] = calculatePortion(carbCals + fruitCals, carbFood)
        }
      }

      // --- LUNCH ---
      else if (m.name.includes('Almoço')) {
        // 25% Protein, 25% Carb, 15% Beans (if selected), 15% Fat, 20% Veg
        const proteinCals = mealCals * 0.30
        const carbCals = mealCals * 0.25
        const beansCals = mealCals * 0.15
        const vegCals = mealCals * 0.10 // Veggies are low cal, this gives good volume
        const fatCals = mealCals * 0.20 // Cooking oil/etc

        const proteinFood = getRandomFood(foodPrefs.proteins, 'chicken')
        itemsToInsert.push(calculatePortion(proteinCals, proteinFood))

        // Beans Logic
        if (foodPrefs.carbs?.includes('beans')) {
            const beansFood = getFoodById('beans')!
            itemsToInsert.push(calculatePortion(beansCals, beansFood))
            
            // Rice/Other Carb
            const otherCarbs = foodPrefs.carbs.filter((c: string) => c !== 'beans')
            const carbFood = getRandomFood(otherCarbs, 'rice_white')
            itemsToInsert.push(calculatePortion(carbCals, carbFood))
        } else {
            // No beans, more carb
            const carbFood = getRandomFood(foodPrefs.carbs, 'rice_white')
            itemsToInsert.push(calculatePortion(carbCals + beansCals, carbFood))
        }

        // Veggies
        if (!foodPrefs.no_veggies) {
            const vegFood = getRandomFood(foodPrefs.veggies, 'lettuce')
            itemsToInsert.push(calculatePortion(vegCals, vegFood))
        }

        // Fat
        const fatFood = getFoodById('olive_oil')!
        itemsToInsert.push(calculatePortion(fatCals, fatFood))
      }

      // --- SNACK ---
      else if (m.name.includes('Lanche')) {
        // 50% Protein/Fat, 50% Fruit/Carb
        const pCals = mealCals * 0.5
        const fCals = mealCals * 0.5
        
        const proteinFood = getRandomFood(foodPrefs.proteins, 'eggs') // Or yogurt if we had it
        itemsToInsert.push(calculatePortion(pCals, proteinFood))

        if (!foodPrefs.no_fruits) {
            const fruitFood = getRandomFood(foodPrefs.fruits, 'apple')
            itemsToInsert.push(calculatePortion(fCals, fruitFood))
        } else {
            const carbFood = getRandomFood(foodPrefs.carbs, 'bread')
            itemsToInsert.push(calculatePortion(fCals, carbFood))
        }
      }

      // --- DINNER ---
      else if (m.name.includes('Jantar')) {
         // Similar to Lunch but maybe less heavy carb if we wanted, but for MVP keep simple ratios
         // 35% Protein, 35% Carb, 20% Veg, 10% Fat
         const proteinCals = mealCals * 0.35
         const carbCals = mealCals * 0.35
         const vegCals = mealCals * 0.20
         const fatCals = mealCals * 0.10

         const proteinFood = getRandomFood(foodPrefs.proteins, 'meat')
         itemsToInsert.push(calculatePortion(proteinCals, proteinFood))

         const carbFood = getRandomFood(foodPrefs.carbs, 'potato')
         itemsToInsert.push(calculatePortion(carbCals, carbFood))

         if (!foodPrefs.no_veggies) {
             const vegFood = getRandomFood(foodPrefs.veggies, 'broccoli')
             itemsToInsert.push(calculatePortion(vegCals, vegFood))
         }
         
         const fatFood = getFoodById('olive_oil')!
         itemsToInsert.push(calculatePortion(fatCals, fatFood))
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
