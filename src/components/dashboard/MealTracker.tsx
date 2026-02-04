'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Utensils } from 'lucide-react'
import { toggleMeal } from '@/app/actions/gamification'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface MealTrackerProps {
  userId: string
  mealsData: Record<string, boolean> // { "0": true, "1": false }
}

const MEALS = [
    { id: 0, label: 'Café da Manhã' },
    { id: 1, label: 'Almoço' },
    { id: 2, label: 'Lanche' },
    { id: 3, label: 'Jantar' }
]

export function MealTracker({ userId, mealsData }: MealTrackerProps) {
  const [state, setState] = useState(mealsData)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (index: number, checked: boolean) => {
    // Optimistic
    const newState = { ...state, [index]: checked }
    setState(newState)

    startTransition(async () => {
        const result = await toggleMeal(userId, index, checked)
        if (result.success) {
            if (checked && result.xpEarned) {
                toast.success(`+${result.xpEarned} XP! Refeição registrada. 🥗`)
            }
        } else {
            setState(state) // Revert
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
        {MEALS.map((meal) => (
            <div key={meal.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                <Checkbox 
                    id={`meal-${meal.id}`} 
                    checked={!!state[meal.id]}
                    onCheckedChange={(c) => handleToggle(meal.id, c as boolean)}
                    disabled={isPending}
                    className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <Label 
                    htmlFor={`meal-${meal.id}`}
                    className={`text-sm cursor-pointer flex-1 ${state[meal.id] ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                >
                    {meal.label}
                </Label>
                {state[meal.id] && (
                    <span className="text-[10px] text-green-600 font-bold px-2 py-0.5 bg-green-100 rounded-full">
                        +15 XP
                    </span>
                )}
            </div>
        ))}
      </CardContent>
    </Card>
  )
}
