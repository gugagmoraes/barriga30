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
  weight?: number // kg
  bottleSize?: number // ml
}

export function WaterTracker({ userId, currentAmount, weight = 70, bottleSize = 500 }: WaterTrackerProps) {
  const [amount, setAmount] = useState(currentAmount)
  const [isPending, startTransition] = useTransition()

  // Business Logic: 35ml per kg
  const dailyGoal = Math.round(weight * 35)
  const bottlesConsumed = (amount / bottleSize).toFixed(1)
  const bottlesGoal = (dailyGoal / bottleSize).toFixed(1)
  
  const percentage = Math.min(100, Math.round((amount / dailyGoal) * 100))

  const handleAddWater = () => {
    // Optimistic update
    const newAmount = amount + bottleSize
    setAmount(newAmount)

    startTransition(async () => {
      const result = await addWater(userId, bottleSize, dailyGoal)
      if (result.success) {
        if (result.xpEarned > 0) {
            toast.success(`Meta atingida! +${result.xpEarned} XP 💧`)
        } else {
            toast.success(`Hidratação registrada (+${bottleSize}ml)`)
        }
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
                <span className="text-2xl font-bold text-blue-700">{bottlesConsumed}</span>
                <span className="text-xs text-blue-400 ml-1">/ {bottlesGoal} garrafas</span>
            </div>
            <div className="text-right">
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full block mb-1">
                    {percentage}%
                </span>
                <span className="text-[10px] text-gray-400">Meta: {dailyGoal}ml</span>
            </div>
        </div>
        
        <Progress value={percentage} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
        
        <div className="flex gap-2">
            <Button 
                onClick={() => {
                    // Logic to remove water
                    // We need a server action for this or modify addWater to accept negative
                    // Let's modify addWater to handle negative in next step or use separate
                    // Since I can't easily add a prop to addWater without breaking signature?
                    // addWater(userId, -bottleSize, dailyGoal) works if bottleSize is just amount.
                    // Wait, logic in addWater: newAmount = current + bottleSize. So negative works.
                    const newAmount = Math.max(0, amount - bottleSize)
                    setAmount(newAmount)
                    startTransition(async () => {
                        await addWater(userId, -bottleSize, dailyGoal)
                    })
                }} 
                disabled={isPending || amount <= 0}
                variant="outline" 
                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
            >
                -
            </Button>
            <Button 
                onClick={handleAddWater} 
                disabled={isPending || amount >= dailyGoal} 
                variant="outline" 
                className="flex-[3] border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
            >
                <Plus className="h-4 w-4 mr-2" />
                + 1 Garrafa ({bottleSize}ml)
            </Button>
        </div>
      </CardContent>
    </Card>
  )
}
