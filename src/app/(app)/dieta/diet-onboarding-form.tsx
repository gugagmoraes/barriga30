'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveDietPreferences } from '@/app/actions/diet'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function DietOnboardingForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      const result = await saveDietPreferences(formData)
      if (result.success) {
        toast.success('Preferências salvas! Gerando sua dieta...')
        // The page will refresh or we can trigger generation here
      } else {
        toast.error('Erro ao salvar preferências.')
      }
    } catch (error) {
      toast.error('Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Vamos montar sua dieta personalizada</CardTitle>
          <CardDescription>
            Precisamos de alguns dados específicos para calcular suas calorias e macronutrientes com precisão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="userId" value={userId} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input id="age" name="age" type="number" required placeholder="Ex: 30" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Sexo Biológico</Label>
                <Select name="gender" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="male">Masculino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso Atual (kg)</Label>
                <Input id="weight" name="weight" type="number" step="0.1" required placeholder="Ex: 70.5" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input id="height" name="height" type="number" required placeholder="Ex: 165" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Frequência de Treino Semanal</Label>
              <Select name="workout_frequency" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2">1 a 2 vezes</SelectItem>
                  <SelectItem value="3-4">3 a 4 vezes</SelectItem>
                  <SelectItem value="5+">5 vezes ou mais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração Média do Treino (minutos)</Label>
              <Input id="duration" name="workout_duration" type="number" required placeholder="Ex: 45" />
            </div>

            <div className="space-y-2">
              <Label>Preferência Principal de Alimentação</Label>
              <p className="text-xs text-muted-foreground mb-2">Selecione o que você prefere (pode marcar mais de um se fizesse sentido, mas aqui focamos no principal)</p>
              <RadioGroup name="food_preference" defaultValue="balanced" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <RadioGroupItem value="balanced" id="balanced" className="peer sr-only" />
                      <Label
                          htmlFor="balanced"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                          <span className="text-xl mb-2">⚖️</span>
                          <span className="font-semibold">Equilibrada</span>
                          <span className="text-xs text-center text-muted-foreground mt-1">Carbo, Proteína e Gordura</span>
                      </Label>
                  </div>
                  <div>
                      <RadioGroupItem value="low_carb" id="low_carb" className="peer sr-only" />
                      <Label
                          htmlFor="low_carb"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                          <span className="text-xl mb-2">🥩</span>
                          <span className="font-semibold">Mais Proteína</span>
                          <span className="text-xs text-center text-muted-foreground mt-1">Foco em carnes e ovos</span>
                      </Label>
                  </div>
                  <div>
                      <RadioGroupItem value="plant_based" id="plant_based" className="peer sr-only" />
                      <Label
                          htmlFor="plant_based"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                          <span className="text-xl mb-2">🥦</span>
                          <span className="font-semibold">Mais Vegetais</span>
                          <span className="text-xs text-center text-muted-foreground mt-1">Leve e natural</span>
                      </Label>
                  </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="water_bottle">Tamanho da sua garrafa de água (ml)</Label>
              <Input id="water_bottle" name="water_bottle_size_ml" type="number" required placeholder="Ex: 500" />
              <p className="text-sm text-muted-foreground">Isso nos ajuda a calcular quantas garrafas você precisa beber.</p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Salvando...' : 'Gerar Minha Dieta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
