'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplets, Plus } from 'lucide-react'
import { addWater } from '@/app/actions/gamification'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface WaterTrackerProps {
  userId: string
  currentAmount: number // ml
  dailyGoal?: number // default 2000
}

export function WaterTracker({ userId, currentAmount, dailyGoal = 2000 }: WaterTrackerProps) {
  const [amount, setAmount] = useState(currentAmount)
  const [isPending, startTransition] = useTransition()

  const percentage = Math.min(100, Math.round((amount / dailyGoal) * 100))

  const handleAddWater = () => {
    // Optimistic update
    const newAmount = amount + 250
    setAmount(newAmount)

    startTransition(async () => {
      const result = await addWater(userId)
      if (result.success) {
        toast.success(`+${result.xpEarned} XP! Hidratação registrada. 💧`)
      } else {
        setAmount(amount) // Revert
        toast.error('Erro ao registrar água.')
      }
    })
  }

  return (
    <Card className="border-blue-100 shadow-sm bg-blue-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500 fill-blue-500" />
            Hidratação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-end">
            <div>
                <span className="text-2xl font-bold text-blue-700">{amount}</span>
                <span className="text-xs text-blue-400 ml-1">/ {dailyGoal} ml</span>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {percentage}%
            </span>
        </div>
        
        <Progress value={percentage} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
        
        <Button 
            onClick={handleAddWater} 
            disabled={isPending}
            variant="outline" 
            className="w-full border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
        >
            <Plus className="h-4 w-4 mr-2" />
            Beber Água (+250ml)
        </Button>
      </CardContent>
    </Card>
  )
}
