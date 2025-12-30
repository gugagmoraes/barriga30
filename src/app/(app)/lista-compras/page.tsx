'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Item = {
  name: string
  baseQuantity: string
  category: string
}

export default function ShoppingListPage() {
  const [snapshot, setSnapshot] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<string>('basic')
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Fetch User Plan
      const { data: userData } = await supabase.from('users').select('plan_type').eq('id', user.id).single()
      if (userData) setUserPlan(userData.plan_type)

      // Fetch Active Snapshot
      const { data: snap } = await supabase
        .from('diet_snapshots')
        .select('*, snapshot_meals(*, snapshot_items(*))')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()
      
      setSnapshot(snap)
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) return <div>Carregando lista...</div>

  if (!snapshot) {
    return (
        <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-700">Lista vazia</h2>
            <p className="text-gray-500">Gere sua dieta primeiro para ver a lista de compras.</p>
        </div>
    )
  }

  // Helper to parse quantity (Very simple heuristic for MVP)
  // In a real app, we would store numeric value and unit separately
  const parseQuantity = (qtyString: string, multiplier: number) => {
    // Attempt to extract number
    const match = qtyString.match(/(\d+)/)
    if (match) {
      const val = parseInt(match[0])
      const unit = qtyString.replace(match[0], '').trim()
      return `${val * multiplier} ${unit}`
    }
    // If no number (e.g. "À vontade"), just return as is with multiplier hint
    return `${qtyString} (x${multiplier} dias)`
  }

  // Aggregate items by category
  const categoriesMap: Record<string, string[]> = {}
  
  // Multiplier: 30 days for monthly, 7 for weekly
  const days = viewMode === 'monthly' ? 30 : 7

  snapshot.snapshot_meals.forEach((meal: any) => {
    meal.snapshot_items.forEach((item: any) => {
      const category = item.category || 'Outros'
      if (!categoriesMap[category]) {
        categoriesMap[category] = []
      }
      
      const totalQty = parseQuantity(item.quantity, days)
      categoriesMap[category].push(`${item.name}: ${totalQty}`)
    })
  })

  // Convert to array for rendering
  const categories = Object.keys(categoriesMap).map(name => ({
    name,
    items: categoriesMap[name]
  }))

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lista de Compras</h1>
          <p className="text-gray-500">Baseada no plano: {snapshot.name}</p>
        </div>
        
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir / PDF
            </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'monthly' | 'weekly')} className="w-full">
        <TabsList>
            <TabsTrigger value="monthly">Mensal (30 dias)</TabsTrigger>
            <TabsTrigger value="weekly" disabled={userPlan !== 'vip'}>
                Semanal {userPlan !== 'vip' && '(VIP)'}
            </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-4">
            <div className="grid gap-6">
                {categories.map((category, index) => (
                    <Card key={index} className="print:shadow-none print:border-none">
                        <CardHeader className="print:p-2">
                            <CardTitle className="text-lg font-semibold text-primary capitalize">{category.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="print:p-2">
                            <div className="space-y-3">
                                {category.items.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="h-5 w-5 rounded border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer hover:border-primary print:border-black">
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
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
            <div className="grid gap-6">
                {categories.map((category, index) => (
                    <Card key={index} className="print:shadow-none print:border-none">
                        <CardHeader className="print:p-2">
                            <CardTitle className="text-lg font-semibold text-primary capitalize">{category.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="print:p-2">
                            <div className="space-y-3">
                                {category.items.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="h-5 w-5 rounded border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer hover:border-primary print:border-black">
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
        </TabsContent>
      </Tabs>
      
      <style jsx global>{`
        @media print {
          nav, aside, button, .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          .card {
            box-shadow: none;
            border: 1px solid #eee;
          }
        }
      `}</style>
    </div>
  )
}
