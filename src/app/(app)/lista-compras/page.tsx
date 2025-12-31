import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingListItem } from './shopping-list-item'

export default async function ShoppingListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div>Faça login.</div>

  // Fetch Active Diet Snapshot
  const { data: snapshot } = await supabase
    .from('diet_snapshots')
    .select('*, snapshot_meals(*, snapshot_items(*))')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!snapshot) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
                <ShoppingCart className="h-8 w-8 text-gray-500" />
            </div>
            <h1 className="text-xl font-bold mb-2">Lista Vazia</h1>
            <p className="text-gray-500 mb-6">
                Você precisa gerar sua dieta primeiro para ver a lista de compras.
            </p>
            <Link href="/dieta">
                <Button>Ir para Dieta</Button>
            </Link>
        </div>
    )
  }

  // Aggregate Items Logic
  const aggregatedItems: Record<string, { total: number, unit: string }> = {}

  snapshot.snapshot_meals.forEach((meal: any) => {
      meal.snapshot_items.forEach((item: any) => {
          const name = item.name
          const qtyStr = item.quantity
          
          let val = 0
          let unit = ''

          // Parse quantity
          const match = qtyStr.match(/^([\d\.]+)\s*(.+)$/)
          if (match) {
              val = parseFloat(match[1])
              unit = match[2] // e.g., "g", "unidade(s)", "fatia(s)"
          } else {
             // Fallback for "À vontade" or weird strings
             val = 1
             unit = 'unidade' // placeholder
          }
          
          // Normalize unit key
          const key = `${name}::${unit}`
          
          if (!aggregatedItems[key]) {
              aggregatedItems[key] = { total: 0, unit }
          }
          aggregatedItems[key].total += val
      })
  })

  const finalItems = Object.entries(aggregatedItems).map(([key, data]) => {
      const [name] = key.split('::')
      const weeklyTotal = Math.ceil(data.total * 7)
      
      let displayQty = ''
      if (data.unit.includes('g')) {
          if (weeklyTotal >= 1000) {
              displayQty = `${(weeklyTotal / 1000).toFixed(1)}kg`
          } else {
              displayQty = `${weeklyTotal}g`
          }
      } else {
          displayQty = `${weeklyTotal} ${data.unit}`
      }
      
      return `${name} - ${displayQty}`
  }).sort()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lista de Compras</h1>
        <Link href="/dieta/pdf" target="_blank">
            <Button variant="outline" size="sm">
                Exportar PDF
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Itens para sua Dieta (Semanal)</CardTitle>
            <p className="text-sm text-gray-500">Baseado no seu plano alimentar atual. Quantidades estimadas para 7 dias.</p>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {finalItems.map((item, index) => (
                    <ShoppingListItem key={index} item={item} />
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
