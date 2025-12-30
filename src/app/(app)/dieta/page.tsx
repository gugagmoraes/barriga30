import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Utensils, Coffee, Sun, Moon, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GenerateDietButton } from './generate-button'
import { RegenerateDietButton } from './regenerate-button'

// Helper to get icon based on meal name (simple heuristic)
const getMealIcon = (name: string) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('café')) return <Coffee className="h-5 w-5 text-orange-400" />
  if (lowerName.includes('almoço')) return <Sun className="h-5 w-5 text-yellow-500" />
  if (lowerName.includes('jantar')) return <Moon className="h-5 w-5 text-indigo-500" />
  return <Utensils className="h-5 w-5 text-green-500" />
}

export default async function DietPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Faça login para ver sua dieta.</div>

  // Fetch User Plan
  const { data: userData } = await supabase.from('users').select('plan_type, weight, height, age').eq('id', user.id).single()
  const planType = userData?.plan_type || 'basic'

  // 1. Fetch Active Diet Snapshot
  const { data: snapshot } = await supabase
    .from('diet_snapshots')
    .select('*, snapshot_meals(*, snapshot_items(*))')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  // 2. Fallback if no snapshot exists (Old user or fresh signup without trigger)
  if (!snapshot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
        <div className="p-4 bg-orange-100 rounded-full">
            <Utensils className="h-10 w-10 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Nenhuma dieta ativa</h1>
        <p className="text-gray-500 max-w-md">
            Parece que você ainda não tem um plano alimentar gerado.
            Clique abaixo para gerar seu plano inicial baseado no nosso modelo padrão.
        </p>
        <GenerateDietButton userId={user.id} />
      </div>
    )
  }

  // Sort meals by order
  const sortedMeals = snapshot.snapshot_meals.sort((a: any, b: any) => a.order_index - b.order_index)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Minha Dieta</h1>
            <p className="text-gray-500">{snapshot.name}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">Meta diária: {snapshot.daily_calories} kcal</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 capitalize">{planType} Plan</span>
            </div>
        </div>
        
        {/* Regenerate Button for Plus/VIP */}
        {planType !== 'basic' && (
            <RegenerateDietButton 
                userId={user.id} 
                currentWeight={userData?.weight || 70}
                currentHeight={userData?.height || 165}
                currentAge={userData?.age || 30}
            />
        )}
      </div>

      <div className="grid gap-4">
          {sortedMeals.map((meal: any) => (
              <Card key={meal.id}>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                      <div className="mr-4 p-2 bg-gray-50 rounded-full">
                          {getMealIcon(meal.name)}
                      </div>
                      <CardTitle className="text-lg font-semibold">{meal.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {meal.snapshot_items.map((item: any) => (
                              <li key={item.id}>
                                {item.quantity} de {item.name}
                              </li>
                          ))}
                      </ul>
                  </CardContent>
              </Card>
          ))}
      </div>
    </div>
  )
}
