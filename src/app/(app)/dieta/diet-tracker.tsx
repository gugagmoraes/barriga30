'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { updateWaterIntake, toggleMealCompletion } from '@/app/actions/tracking'
import { Droplets, Plus, Minus, Trophy } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface DietTrackerProps {
  snapshot: any
  dailyTracking: any
  date: string
}

export function DietTracker({ snapshot, dailyTracking, date }: DietTrackerProps) {
  const macros = snapshot.macros || {}
  const waterTarget = macros.water_target_ml || 2000
  const bottleSize = macros.water_bottle_size || 500
  const targetBottles = macros.bottles_count || 4

  const currentWater = dailyTracking?.water_ml || 0
  const currentBottles = Math.floor(currentWater / bottleSize)
  const waterProgress = Math.min(100, (currentWater / waterTarget) * 100)

  const mealsCompleted = dailyTracking?.meals_completed || 0
  const totalMeals = snapshot.snapshot_meals.length

  // Optimistic UI could be added here, but sticking to simple server actions for reliability first

  return (
    <div className="space-y-6">
      {/* Gamification Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4 flex flex-col items-center text-center">
                <Droplets className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-2xl font-bold text-blue-700">{currentWater}ml</span>
                <span className="text-xs text-blue-600">Meta: {waterTarget}ml</span>
            </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
            <CardContent className="p-4 flex flex-col items-center text-center">
                <Trophy className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-2xl font-bold text-green-700">{mealsCompleted}/{totalMeals}</span>
                <span className="text-xs text-green-600">Refeições</span>
            </CardContent>
        </Card>
         <Card>
            <CardContent className="p-4 flex flex-col items-center text-center">
                <span className="text-sm text-gray-500">Calorias</span>
                <span className="text-xl font-bold">{snapshot.daily_calories}</span>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4 flex flex-col items-center text-center">
                <span className="text-sm text-gray-500">Proteína</span>
                <span className="text-xl font-bold">{macros.protein}g</span>
            </CardContent>
        </Card>
      </div>

      {/* Água Tracker */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                ÁGUA ({bottleSize}ml por garrafa)
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Progress 
                value={waterProgress} 
                className="h-4" 
                indicatorClassName="bg-green-500" // Use CSS variable or class if supported by component, otherwise inline style or class override
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {Array.from({ length: targetBottles }).map((_, i) => (
                            <Droplets 
                                key={i} 
                                className={`h-6 w-6 ${i < currentBottles ? 'text-green-500 fill-green-500' : 'text-orange-300'}`} 
                            />
                        ))}
                    </div>
                    <div className="ml-2">
                        <span className="text-sm text-gray-700 font-medium">{currentBottles}/{targetBottles} garrafas</span>
                        <p className="text-xs text-gray-500">Conte apenas água pura (sem suco, café ou refrigerante).</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => updateWaterIntake(date, -bottleSize)}
                        disabled={currentWater <= 0}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="default" 
                        size="icon"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => updateWaterIntake(date, bottleSize)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Meals List */}
      <div className="space-y-4">
          <h2 className="text-xl font-bold">Refeições do Dia</h2>
          {snapshot.snapshot_meals.sort((a: any, b: any) => a.order_index - b.order_index).map((meal: any, index: number) => {
              const isChecked = index < mealsCompleted
              return (
                  <Card key={meal.id} className={`transition-colors ${isChecked ? 'bg-green-50 border-green-200' : ''}`}>
                      <CardContent className="p-4 flex items-start gap-4">
                          <Checkbox 
                            checked={isChecked}
                            onCheckedChange={(checked) => toggleMealCompletion(date, checked as boolean)}
                            // Disable if it's not the next logical meal to prevent disorder (optional, but good for count-based)
                            // For now allowing loose checking but visual feedback might be weird if out of order
                            disabled={index > mealsCompleted || (index < mealsCompleted - 1)} 
                          />
                          <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className={`font-bold ${isChecked ? 'text-green-800 line-through' : ''}`}>{meal.name}</h3>
                                <div className="text-right text-xs text-gray-500 bg-gray-50 p-1 rounded">
                                    <div className="font-semibold">{meal.snapshot_items.reduce((acc: number, i: any) => acc + (i.calories || 0), 0)} kcal</div>
                                    <div className="flex gap-2">
                                        <span className="text-blue-600">P: {meal.snapshot_items.reduce((acc: number, i: any) => acc + (i.protein || 0), 0).toFixed(0)}g</span>
                                        <span className="text-orange-600">C: {meal.snapshot_items.reduce((acc: number, i: any) => acc + (i.carbs || 0), 0).toFixed(0)}g</span>
                                        <span className="text-yellow-600">G: {meal.snapshot_items.reduce((acc: number, i: any) => acc + (i.fat || 0), 0).toFixed(0)}g</span>
                                    </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">{meal.time_of_day?.slice(0, 5)}</p>
                              <ul className="text-sm space-y-1">
                                  {meal.snapshot_items
                                    .sort((a: any, b: any) => getItemOrder(a.name) - getItemOrder(b.name))
                                    .map((item: any) => (
                                      <li key={item.id} className="text-gray-700 flex justify-between">
                                          <span>{item.quantity} {item.name}</span>
                                          {/* Optional: Show per item macros if detailed view is enabled, keeping simple for now */}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </CardContent>
                  </Card>
              )
          })}
      </div>
    </div>
  )
}
