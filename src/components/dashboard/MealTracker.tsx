'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, Utensils } from 'lucide-react'
import { toggleMeal } from '@/app/actions/gamification'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface MealTrackerProps {
  mealsCompleted: number
  meals: Array<{
    id: string
    name: string
    time_of_day?: string | null
    snapshot_items: Array<{
      id: string
      name: string
      quantity: string
      calories?: number | null
      protein?: number | null
      carbs?: number | null
      fat?: number | null
    }>
  }>
}

export function MealTracker({ mealsCompleted, meals }: MealTrackerProps) {
  const [count, setCount] = useState(mealsCompleted)
  const [open, setOpen] = useState<Record<number, boolean>>({})
  const [isPending, startTransition] = useTransition()

  const handleToggle = (index: number, checked: boolean) => {
    startTransition(async () => {
        const result = await toggleMeal(index, checked)
        if (result.success) {
            if (checked && result.xpEarned) {
                toast.success(`+${result.xpEarned} XP! Refeição registrada. 🥗`)
            }
            if (typeof (result as any).mealsCompleted === 'number') {
              setCount((result as any).mealsCompleted)
            }
        } else {
            toast.error('Erro ao atualizar refeição.')
        }
    })
  }

  return (
    <Card className="border-green-100 shadow-sm bg-green-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Utensils className="h-4 w-4 text-green-600" />
            Dieta de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {meals.map((meal, index) => {
          const isChecked = index < count
          const canCheck = index === count
          const canUncheck = index === count - 1
          const disabled = isPending || (!isChecked && !canCheck) || (isChecked && !canUncheck)
          const isOpen = !!open[index]
          const calories = meal.snapshot_items.reduce((acc, i) => acc + (i.calories || 0), 0)
          const protein = meal.snapshot_items.reduce((acc, i) => acc + (i.protein || 0), 0)
          const carbs = meal.snapshot_items.reduce((acc, i) => acc + (i.carbs || 0), 0)
          const fat = meal.snapshot_items.reduce((acc, i) => acc + (i.fat || 0), 0)

          return (
            <div key={meal.id} className={`rounded-lg border ${isChecked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 p-3">
                <Checkbox
                  id={`meal-${meal.id}`}
                  checked={isChecked}
                  onCheckedChange={(c) => handleToggle(index, c as boolean)}
                  disabled={disabled}
                  className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <button
                  type="button"
                  onClick={() => setOpen((prev) => ({ ...prev, [index]: !prev[index] }))}
                  className="flex-1 flex items-center justify-between text-left"
                >
                  <div className="min-w-0">
                    <Label
                      htmlFor={`meal-${meal.id}`}
                      className={`text-sm cursor-pointer block ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                    >
                      {meal.name}
                    </Label>
                    {meal.time_of_day && (
                      <div className="text-[11px] text-gray-500">{meal.time_of_day.slice(0, 5)}</div>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {isOpen && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 flex justify-between">
                    <span className="font-semibold">{calories} kcal</span>
                    <span className="flex gap-2">
                      <span className="text-blue-600">P: {protein.toFixed(0)}g</span>
                      <span className="text-orange-600">C: {carbs.toFixed(0)}g</span>
                      <span className="text-yellow-600">G: {fat.toFixed(0)}g</span>
                    </span>
                  </div>
                  <ul className="text-sm space-y-1">
                    {meal.snapshot_items.map((item) => (
                      <li key={item.id} className="text-gray-700 flex justify-between gap-3">
                        <span className="truncate">{item.quantity} {item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
