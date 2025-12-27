import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ShoppingListPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Faça login para ver sua lista.</div>

  // Fetch Active Diet Snapshot (Source of Truth)
  const { data: snapshot } = await supabase
    .from('diet_snapshots')
    .select('*, snapshot_meals(*, snapshot_items(*))')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!snapshot) {
    return (
        <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-700">Lista vazia</h2>
            <p className="text-gray-500">Gere sua dieta primeiro para ver a lista de compras.</p>
        </div>
    )
  }

  // Aggregate items by category
  const categoriesMap: Record<string, string[]> = {}

  snapshot.snapshot_meals.forEach((meal: any) => {
    meal.snapshot_items.forEach((item: any) => {
      const category = item.category || 'Outros'
      if (!categoriesMap[category]) {
        categoriesMap[category] = []
      }
      categoriesMap[category].push(`${item.name} (${item.quantity})`)
    })
  })

  // Convert to array for rendering
  const categories = Object.keys(categoriesMap).map(name => ({
    name,
    items: categoriesMap[name]
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lista de Compras</h1>
        <Button variant="outline" size="sm">
            Exportar CSV
        </Button>
      </div>
      <p className="text-gray-500">Baseada no plano: {snapshot.name}</p>

      <div className="grid gap-6">
          {categories.map((category, index) => (
              <Card key={index}>
                  <CardHeader>
                      <CardTitle className="text-lg font-semibold text-primary capitalize">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-3">
                          {category.items.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                  <div className="h-5 w-5 rounded border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer hover:border-primary">
                                      <CheckSquare className="h-3 w-3 text-transparent hover:text-gray-300" />
                                  </div>
                                  <span className="text-gray-700">{item}</span>
                              </div>
                          ))}
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>
    </div>
  )
}
