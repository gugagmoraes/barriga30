export type FoodCategory = 'protein' | 'carb' | 'veg' | 'fruit' | 'fat'

export interface FoodItem {
    id: string
    label: string
    category: FoodCategory
    calories: number // kcal per 100g (or per unit if unit='unidade')
    protein: number // g
    carbs: number // g
    fat: number // g
    unit: 'g' | 'unidade' | 'fatia' | 'colher'
    default_portion: number // default portion size in 'unit'
}

export const FOOD_DB: FoodItem[] = [
    // Proteins
    { id: 'chicken', label: 'Frango Grelhado/Cozido', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: 'g', default_portion: 100 },
    { id: 'meat', label: 'Carne Bovina Magra (Moída/Bife)', category: 'protein', calories: 250, protein: 26, carbs: 0, fat: 15, unit: 'g', default_portion: 100 },
    { id: 'eggs', label: 'Ovos Cozidos/Mexidos', category: 'protein', calories: 70, protein: 6, carbs: 0.5, fat: 5, unit: 'unidade', default_portion: 2 },
    { id: 'fish', label: 'Peixe (Tilápia/Merluza)', category: 'protein', calories: 96, protein: 20, carbs: 0, fat: 1.7, unit: 'g', default_portion: 100 },
    { id: 'pork', label: 'Lombo Suíno Magro', category: 'protein', calories: 143, protein: 26, carbs: 0, fat: 3.5, unit: 'g', default_portion: 100 },

    // Carbs
    { id: 'rice_white', label: 'Arroz Branco Cozido', category: 'carb', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: 'g', default_portion: 100 },
    { id: 'rice_brown', label: 'Arroz Integral Cozido', category: 'carb', calories: 110, protein: 2.6, carbs: 23, fat: 0.9, unit: 'g', default_portion: 100 },
    { id: 'beans', label: 'Feijão (Carioca/Preto) Cozido', category: 'carb', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, unit: 'g', default_portion: 100 }, // Beans are mixed but primarily carb source in macros context for simplicity or distinct
    { id: 'pasta', label: 'Macarrão Cozido', category: 'carb', calories: 157, protein: 5.8, carbs: 30, fat: 0.9, unit: 'g', default_portion: 100 },
    { id: 'potato', label: 'Batata Inglesa Cozida', category: 'carb', calories: 86, protein: 1.7, carbs: 20, fat: 0.1, unit: 'g', default_portion: 100 },
    { id: 'sweet_potato', label: 'Batata Doce Cozida', category: 'carb', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: 'g', default_portion: 100 },
    { id: 'bread', label: 'Pão Francês', category: 'carb', calories: 135, protein: 4.7, carbs: 28, fat: 0.5, unit: 'unidade', default_portion: 1 }, // ~50g unit
    { id: 'sliced_bread', label: 'Pão de Forma Integral', category: 'carb', calories: 60, protein: 3, carbs: 11, fat: 1, unit: 'fatia', default_portion: 2 },
    { id: 'tapioca', label: 'Tapioca (Goma)', category: 'carb', calories: 240, protein: 0, carbs: 60, fat: 0, unit: 'g', default_portion: 60 }, // heavy carb
    { id: 'cuscuz', label: 'Cuscuz de Milho', category: 'carb', calories: 112, protein: 3.8, carbs: 23, fat: 0.7, unit: 'g', default_portion: 100 },

    // Veggies (Low cal, mostly for volume/micronutrients)
    { id: 'lettuce', label: 'Alface', category: 'veg', calories: 15, protein: 1, carbs: 3, fat: 0, unit: 'g', default_portion: 50 },
    { id: 'tomato', label: 'Tomate', category: 'veg', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: 'unidade', default_portion: 1 },
    { id: 'carrot', label: 'Cenoura (Ralada/Cozida)', category: 'veg', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, unit: 'g', default_portion: 50 },
    { id: 'broccoli', label: 'Brócolis', category: 'veg', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, unit: 'g', default_portion: 80 },
    { id: 'zucchini', label: 'Abobrinha', category: 'veg', calories: 17, protein: 1.2, carbs: 3, fat: 0.3, unit: 'g', default_portion: 80 },
    { id: 'spinach', label: 'Espinafre', category: 'veg', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, unit: 'g', default_portion: 80 },
    { id: 'onion', label: 'Cebola', category: 'veg', calories: 40, protein: 1, carbs: 9, fat: 0, unit: 'g', default_portion: 30 },

    // Fruits
    { id: 'banana', label: 'Banana Prata', category: 'fruit', calories: 98, protein: 1.3, carbs: 26, fat: 0.1, unit: 'unidade', default_portion: 1 },
    { id: 'apple', label: 'Maçã', category: 'fruit', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: 'unidade', default_portion: 1 },
    { id: 'papaya', label: 'Mamão Papaia', category: 'fruit', calories: 43, protein: 0.5, carbs: 11, fat: 0.1, unit: 'fatia', default_portion: 1 }, // 1/2 papaya usually ~150g
    { id: 'orange', label: 'Laranja', category: 'fruit', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, unit: 'unidade', default_portion: 1 },
    { id: 'strawberry', label: 'Morango', category: 'fruit', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, unit: 'g', default_portion: 100 },
    { id: 'watermelon', label: 'Melancia', category: 'fruit', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, unit: 'fatia', default_portion: 1 },

    // Fats (Used for cooking/dressing)
    { id: 'olive_oil', label: 'Azeite de Oliva', category: 'fat', calories: 119, protein: 0, carbs: 0, fat: 13.5, unit: 'colher', default_portion: 1 },
    { id: 'butter', label: 'Manteiga', category: 'fat', calories: 100, protein: 0, carbs: 0, fat: 11, unit: 'colher', default_portion: 0.5 },
]

export const getFoodById = (id: string) => FOOD_DB.find(f => f.id === id)
export const getFoodsByCategory = (cat: FoodCategory) => FOOD_DB.filter(f => f.category === cat)
