import { createClient } from '@/lib/supabase/server'
import { PlanType } from '@/types/database.types'
import { startOfMonth } from 'date-fns'
import { getFoodById, FoodItem } from '@/lib/food-db'
import { geminiModel } from '@/lib/gemini'

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
}

async function generateDietWithAI(userProfile: any, targets: any): Promise<any> {
  const prompt = `
    Atue como um nutricionista especialista do método "Barriga 30". Crie um plano alimentar diário personalizado.
    
    PERFIL DO PACIENTE:
    - Gênero: ${userProfile.gender}
    - Idade: ${userProfile.age} anos
    - Peso: ${userProfile.weight} kg
    - Altura: ${userProfile.height} cm
    - Objetivo: Emagrecimento / Definição
    
    METAS NUTRICIONAIS DIÁRIAS:
    - Calorias Totais: ${targets.calories} kcal (Tente ficar próximo, margem +/- 50kcal)
    - Proteínas: ~${targets.macros.protein}g
    - Carboidratos: ~${targets.macros.carbs}g
    - Gorduras: ~${targets.macros.fat}g
    
    PREFERÊNCIAS E RESTRIÇÕES:
    - Preferências: ${JSON.stringify(userProfile.foodPrefs)}
    - Estrutura de Refeições: Café da Manhã, Almoço, Lanche da Tarde, Jantar.
    
    REGRAS DO MÉTODO BARRIGA 30:
    1. Priorize comida de verdade (arroz, feijão, ovos, frango, frutas, legumes).
    2. Café da manhã deve ser proteico.
    3. Almoço e Jantar devem seguir o prato ideal: Proteína + Carboidrato + Vegetais.
    4. Se houver arroz e feijão, a quantidade de feijão deve ser metade da de arroz.
    5. Evite ultraprocessados.
    
    SAÍDA ESPERADA (JSON):
    Retorne APENAS um JSON válido com a estrutura abaixo, sem markdown ou texto extra:
    {
      "meals": [
        {
          "name": "Café da Manhã",
          "time": "08:00",
          "items": [
            { 
              "name": "Nome do alimento", 
              "quantity": "Quantidade descritiva (ex: 2 ovos, 100g)", 
              "calories": 100, 
              "protein": 10, 
              "carbs": 5, 
              "fat": 2, 
              "category": "protein" 
            }
          ]
        }
        // ... repetir para Almoço, Lanche da Tarde, Jantar
      ]
    }
    Use as categorias: 'protein', 'carb', 'fat', 'fruit', 'vegetable', 'drink'.
  `;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Simple cleanup for markdown code blocks if the model adds them
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erro na geração de dieta via IA:", error);
    return null; // Return null to trigger fallback
  }
}

function calculateTMB(weight: number, height: number, age: number, gender: string): number {
  // Harris-Benedict (Women)
  // TMB = 655 + (9.6 × peso) + (1.8 × altura) - (4.7 × idade)
  if (gender.toLowerCase().startsWith('f')) {
    return Math.round(655 + (9.6 * weight) + (1.8 * height) - (4.7 * age))
  }
  // Harris-Benedict (Men) - Optional/Fallback
  return Math.round(66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age))
}

function calculateDailyExerciseBurn(workoutDurationStr: string, workoutFrequencyStr: string): number {
  // Estimate calories per session
  let calPerSession = 0
  const duration = parseInt(workoutDurationStr || '0', 10)
  
  if (duration >= 30) calPerSession = 300
  else if (duration >= 20) calPerSession = 200
  else if (duration >= 15) calPerSession = 150
  else calPerSession = 0

  // Parse frequency
  let freq = 0
  if (workoutFrequencyStr === '1-2') freq = 2
  else if (workoutFrequencyStr === '3-4') freq = 4
  else if (workoutFrequencyStr === '5+') freq = 5
  else freq = 0

  // Weekly burn -> Daily average
  const weeklyBurn = calPerSession * freq
  return Math.round(weeklyBurn / 7)
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
  // Special rule for Tomato: always in grams, max 80g
  if (food.id === 'tomato') {
    let grams = 80 // Max per rule
    // Adjust if target cals is very low, but usually tomato is low cal. 80g tomato ~15kcal.
    // Allow calc but cap at 80g.
    const calculatedGrams = Math.round((targetCals / food.calories) * 100 / 10) * 10
    grams = Math.min(grams, calculatedGrams)
    if (grams < 20) grams = 20 // Min 20g
    const protein = Number(((grams / 100) * food.protein).toFixed(1))
    const carbs = Number(((grams / 100) * food.carbs).toFixed(1))
    const fat = Number(((grams / 100) * food.fat).toFixed(1))
    return { name: food.label, qty: `${grams}g`, cal: Math.round((grams / 100) * food.calories), rawQty: grams, unit: 'g', category: food.category, protein, carbs, fat }
  }

  if (food.id === 'yogurt_natural') {
    const grams = 170 // Standard pot size
    const protein = Number(((grams / 100) * food.protein).toFixed(1))
    const carbs = Number(((grams / 100) * food.carbs).toFixed(1))
    const fat = Number(((grams / 100) * food.fat).toFixed(1))
    return { name: food.label, qty: `${grams}g (1 pote)`, cal: Math.round((grams / 100) * food.calories), rawQty: grams, unit: 'g', category: food.category, protein, carbs, fat }
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

export async function checkDietRegenerationLimit(userId: string, planType: PlanType): Promise<{ allowed: boolean; reason?: string }> {
  return { allowed: true }
}

async function isDietValid(snapshot: any, foodPrefs: any) {
  const hasRice = (name: string) => name.toLowerCase().includes('arroz')
  const hasBeans = (name: string) => name.toLowerCase().includes('feij')
  const hasBread = (name: string) => name.toLowerCase().includes('pão') || name.toLowerCase().includes('forma')
  const hasSweetPotato = (name: string) => name.toLowerCase().includes('batata doce')
  let fruitCount = 0
  let totalRiceGrams = 0
  let totalSweetPotatoGrams = 0
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
      // Require meat/fish/chicken/pork presence (eggs alone not allowed)
      const proteinItems = items.filter((i: any) => i.category === 'protein')
      const hasMeat = proteinItems.some((p: any) => {
        const n = (p.name || '').toLowerCase()
        return n.includes('frango') || n.includes('carne') || n.includes('peixe') || n.includes('porco')
      })
      if (!hasMeat) return false
      // Enforce Rice >= Beans by grams
      const rice = items.find((i: any) => hasRice(i.name))
      const beans = items.find((i: any) => hasBeans(i.name))
      const parseGrams = (q: string) => {
        const m = (q || '').match(/(\d+)\s*g/i)
        return m ? parseInt(m[1], 10) : 0
      }
      if (rice && beans) {
        const rg = parseGrams(rice.quantity)
        const bg = parseGrams(beans.quantity)
        // GLOBAL RULE: Beans must be <= Rice * 0.6
        // This is strictly enforced for cultural consistency
        if (bg > (rg * 0.6)) return false
        if (bg >= rg) return false
      }
    }
    if (meal.name.includes('Café')) {
      const hasProtein = items.some((i: any) => i.category === 'protein')
      if (!hasProtein) return false
      // Breakfast Rule: No heavy meat (beef, pork, fish). Only eggs/chicken/cheese.
      const heavyMeat = items.some((i: any) => {
         const n = (i.name || '').toLowerCase()
         return n.includes('carne') || n.includes('peixe') || n.includes('porco')
      })
      if (heavyMeat) return false

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
    // Day-level rice vs sweet potato
    for (const it of items) {
      const qty = it.quantity as string
      const m = (qty || '').match(/(\d+)\s*g/i)
      const grams = m ? parseInt(m[1], 10) : 0
      if (hasRice(it.name)) totalRiceGrams += grams
      if (hasSweetPotato(it.name)) totalSweetPotatoGrams += grams
    }
  }
  if (fruitCount > 2) return false
  if (totalSweetPotatoGrams > 0 && totalSweetPotatoGrams >= totalRiceGrams) return false
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

export async function generateDietForUser(userId: string): Promise<any> {
  const supabase = await createClient()
  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
  // Ensure we get the active preferences
  const { data: prefs } = await supabase.from('diet_preferences').select('*').eq('user_id', userId).eq('is_active', true).single()
  
  if (!user) throw new Error('User not found')
  
  const limitCheck = await checkDietRegenerationLimit(userId, user.plan_type)
  if (!limitCheck.allowed) throw new Error(limitCheck.reason || 'Not allowed')

  const weight = prefs?.weight || user.weight || 70
  const height = prefs?.height || user.height || 165
  const age = prefs?.age || user.age || 30
  const gender = prefs?.gender || user.gender || 'female'
  const workoutFreq = prefs?.workout_frequency || '1-2'
  const workoutDur = prefs?.workout_duration || '15'
  
  const foodPrefs = prefs?.food_preferences || {}
  const bottleSize = prefs?.water_bottle_size_ml || 500

  const tmb = calculateTMB(weight, height, age, gender)
  const dailyExerciseBurn = calculateDailyExerciseBurn(workoutDur, workoutFreq)
  
  // TDEE is effectively TMB + Exercise (plus maybe slight NEAT bump, but keeping simple as requested)
  // Request: "O gasto calórico semanal será somado ao valor da TMB." -> Interpreted as daily avg
  // Request: "Subtrair 500 calorias para o déficit calórico."
  
  const totalDailyExpenditure = tmb + dailyExerciseBurn
  const targetCalories = Math.max(1200, totalDailyExpenditure - 500)
  
  const waterTargetMl = Math.round(weight * 35)
  const bottlesCount = Math.ceil(waterTargetMl / bottleSize)

  // Deactivate any existing active snapshots
  await supabase.from('diet_snapshots').update({ is_active: false }).eq('user_id', userId)

  let finalSnapshot = null
  
  // Tenta gerar com IA primeiro
  try {
    console.log(`[DietGen] Starting AI generation for user ${userId}`);
    const aiPlan = await generateDietWithAI(
      { gender, age, weight, height, foodPrefs },
      { calories: targetCalories, macros: { protein: Math.round(targetCalories * 0.3 / 4), carbs: Math.round(targetCalories * 0.4 / 4), fat: Math.round(targetCalories * 0.3 / 9), water_target_ml: waterTargetMl } }
    );

    if (aiPlan && aiPlan.meals && Array.isArray(aiPlan.meals)) {
      // Persist AI Plan
       const { data: snapshot, error: snapError } = await supabase.from('diet_snapshots').insert({ 
          user_id: userId, 
          daily_calories: targetCalories, 
          name: `Plano AI (${targetCalories} kcal)`, 
          origin: 'ai_generated', 
          is_active: true, 
          macros: { 
              protein: Math.round(targetCalories * 0.3 / 4),
              carbs: Math.round(targetCalories * 0.4 / 4),
              fat: Math.round(targetCalories * 0.3 / 9),
              water_target_ml: waterTargetMl, 
              water_bottle_size: bottleSize, 
              bottles_count: bottlesCount, 
              tmb, 
              tdee: totalDailyExpenditure 
          } 
      }).select().single()

      if (snapshot && !snapError) {
        let order = 1;
        for (const meal of aiPlan.meals) {
           const { data: mealData } = await supabase.from('snapshot_meals').insert({ 
             diet_snapshot_id: snapshot.id, 
             name: meal.name, 
             order_index: order++, 
             time_of_day: meal.time || '00:00' 
           }).select().single();
           
           if (mealData && meal.items) {
             for (const item of meal.items) {
               await supabase.from('snapshot_items').insert({ 
                 snapshot_meal_id: mealData.id, 
                 name: item.name, 
                 quantity: item.quantity, 
                 calories: item.calories || 0, 
                 category: item.category || 'other', 
                 protein: item.protein || 0, 
                 carbs: item.carbs || 0, 
                 fat: item.fat || 0 
               });
             }
           }
        }
        await persistShoppingLists(userId, snapshot);
        await supabase.from('diet_regenerations').insert({ user_id: userId });
        return snapshot; // Return early if AI succeeds
      }
    }
  } catch (err) {
    console.error("[DietGen] AI generation failed, falling back to algorithm", err);
  }

  // Fallback to existing algorithm if AI fails or returns invalid data
  console.log("[DietGen] Using algorithmic generation fallback");
  const maxAttempts = 3

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`[DietGen] Attempt ${attempt + 1}/${maxAttempts} for user ${userId}`)
      
      const { data: snapshot, error: snapError } = await supabase.from('diet_snapshots').insert({ 
          user_id: userId, 
          daily_calories: targetCalories, 
          name: `Plano Personalizado (${targetCalories} kcal)`, 
          origin: 'ai_generated', 
          is_active: true, 
          macros: { 
              protein: Math.round(targetCalories * 0.3 / 4), // 30% Protein
              carbs: Math.round(targetCalories * 0.4 / 4),   // 40% Carbs
              fat: Math.round(targetCalories * 0.3 / 9),     // 30% Fat
              water_target_ml: waterTargetMl, 
              water_bottle_size: bottleSize, 
              bottles_count: bottlesCount, 
              tmb, 
              tdee: totalDailyExpenditure 
          } 
      }).select().single()

      if (snapError || !snapshot) {
          console.error('[DietGen] Failed to create snapshot:', snapError)
          continue
      }

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
          const proteinChoices = (foodPrefs.proteins || []).filter((id: string) => ['chicken','meat','fish','pork'].includes(id))
          const pFood = getRandomFood(proteinChoices.length ? proteinChoices : foodPrefs.proteins, 'chicken')
          const pItem = calculatePortion(pCals, pFood)
          
          const orderedItems: any[] = []
          
          lunchProteinFoodRef = pFood
          lunchProteinCal = pItem.cal
          const carbBudget = mealCals - pItem.cal
          let carbFood = getFoodById('rice_white')!
          if (foodPrefs.carbs?.includes('rice_white') || foodPrefs.carbs?.includes('rice_brown')) carbFood = getRandomFood(foodPrefs.carbs, 'rice_white', ['rice_white','rice_brown'])
          let riceCals = carbBudget
          let beansCals = 0
          let bItem: any = null
          if (foodPrefs.carbs?.includes('beans')) {
            // GLOBAL RULE IMPLEMENTATION:
            // Calculate Rice grams first, then set Beans grams = 50% of Rice grams
            // This ensures strict adherence to the visual proportion rule.
            // Formula: Budget = (G_rice * K_rice) + (G_beans * K_beans)
            //         G_beans = 0.5 * G_rice
            //         Budget = G_rice * (K_rice + 0.5 * K_beans)
            //         G_rice = Budget / (K_rice + 0.5 * K_beans)

            const targetBeanRatio = 0.5 // 50% of rice weight
            const kRice = carbFood.calories / 100
            const beanFood = getFoodById('beans')!
            const kBeans = beanFood.calories / 100

            const gRice = Math.round(carbBudget / (kRice + (targetBeanRatio * kBeans)))
            const gBeans = Math.round(gRice * targetBeanRatio)

            riceCals = Math.round(gRice * kRice)
            beansCals = Math.round(gBeans * kBeans)
            
            // Recalculate portions explicitly with grams to ensure precision
            // We use a custom call to calculatePortion that respects the exact gram target if possible,
            // but since calculatePortion logic is based on calories, we pass the derived calories.
            // The existing calculatePortion will convert back to grams ~ closely.
            // To be safe, we rely on the calorie math above being consistent with the food DB.

            bItem = calculatePortion(beansCals, beanFood)
            lunchBeansUsed = true
            lunchBeansCal = bItem.cal
          }
          const cItem = calculatePortion(riceCals, carbFood)
          orderedItems.push(cItem) 
          if (bItem) orderedItems.push(bItem) 
          
          orderedItems.push(pItem) 
          
          lunchCarbFoodRef = carbFood
          lunchCarbCal = cItem.cal
          if (!foodPrefs.no_veggies) {
            const vegFood = getFoodById('lettuce')!
            orderedItems.push(calculatePortion(15, vegFood)) 
            if (foodPrefs.veggies?.includes('tomato')) orderedItems.push(calculatePortion(20, getFoodById('tomato')!, 1)) 
          }
          itemsToInsert.push(...orderedItems)
        } else if (m.name.includes('Lanche')) {
          const pCals = Math.round(mealCals * 0.5)
          const cCals = mealCals - pCals
          let snackProteins = (foodPrefs.proteins || [])
          if (snackProteins.includes('eggs')) snackProteins = ['eggs']
          const pFood = getRandomFood(snackProteins, 'eggs')
          
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
          
          const carbFood = lunchCarbFoodRef || getFoodById('rice_white')!
          let riceCals = Math.round(lunchCarbCal * 0.8)
          
          if (lunchBeansUsed) {
            const bFood = getFoodById('beans')!
            // Apply same logic for Dinner: maintain ratio if both exist
            // Dinner is roughly 80% of Lunch size for these items
            
            // Re-calculate based on the reduced rice calories to maintain ratio
            // If lunch followed the ratio, reducing both by 0.8 keeps the ratio.
            // Rice Cal * 0.8 -> Rice Grams * 0.8
            // Bean Cal * 0.8 -> Bean Grams * 0.8
            // Ratio holds.
            
            const bCals = Math.round(lunchBeansCal * 0.8)
            itemsToInsert.push(calculatePortion(bCals, bFood))
          }
          
          itemsToInsert.push(calculatePortion(riceCals, carbFood))
          
          if (!foodPrefs.no_veggies) {
            const vegFood = getFoodById('broccoli')!
            itemsToInsert.push(calculatePortion(30, vegFood))
          }
        }
        for (const it of itemsToInsert) {
          await supabase.from('snapshot_items').insert({ snapshot_meal_id: mealData.id, name: it.name, quantity: it.qty, calories: it.cal, category: it.category, protein: it.protein, carbs: it.carbs, fat: it.fat })
        }
      }

      // Fetch full structure to validate
      const { data: fullSnapshot } = await supabase.from('diet_snapshots').select('*, snapshot_meals(*, snapshot_items(*))').eq('id', snapshot.id).single()
      
      const isValid = fullSnapshot ? await isDietValid(fullSnapshot, foodPrefs) : false
      
      if (isValid) {
          finalSnapshot = fullSnapshot
          break
      }

      // If invalid, cleanup unless it's the last attempt (where we might just accept it as fallback)
      if (attempt < maxAttempts - 1) {
          console.log('[DietGen] Invalid diet generated, retrying...')
          await supabase.from('snapshot_items').delete().in('snapshot_meal_id', fullSnapshot?.snapshot_meals.map((m: any) => m.id) || [])
          await supabase.from('snapshot_meals').delete().eq('diet_snapshot_id', snapshot.id)
          await supabase.from('diet_snapshots').delete().eq('id', snapshot.id)
      } else {
          console.warn('[DietGen] Max attempts reached, returning last snapshot even if invalid')
          finalSnapshot = fullSnapshot
      }
  }

  if (finalSnapshot) {
      await supabase.from('diet_regenerations').insert({ user_id: userId })
      await persistShoppingLists(userId, finalSnapshot)
  } else {
      throw new Error('Failed to generate diet after multiple attempts')
  }
  
  return finalSnapshot
}
