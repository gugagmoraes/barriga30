'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveDietPreferences } from '@/app/actions/diet'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FOOD_DB, getFoodsByCategory } from '@/lib/food-db'

export function DietOnboardingForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [selectedFrequency, setSelectedFrequency] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('')
  
  // Food selection state
  const [selectedProteins, setSelectedProteins] = useState<string[]>([])
  const [selectedCarbs, setSelectedCarbs] = useState<string[]>([])
  const [selectedVeggies, setSelectedVeggies] = useState<string[]>([])
  const [selectedFruits, setSelectedFruits] = useState<string[]>([])
  
  const [noVeggies, setNoVeggies] = useState(false)
  const [noFruits, setNoFruits] = useState(false)

  const toggleFood = (id: string, list: string[], setList: any) => {
    if (list.includes(id)) {
        setList(list.filter(item => item !== id))
    } else {
        setList([...list, id])
    }
  }

  const handleSubmit = async (formData: FormData) => {
    if (!selectedFrequency || !selectedDuration) {
        toast.error('Selecione a frequência e duração do treino.')
        return
    }

    if (selectedProteins.length === 0) {
        toast.error('Selecione pelo menos uma proteína.')
        return
    }
    if (selectedCarbs.length === 0) {
        toast.error('Selecione pelo menos um carboidrato.')
        return
    }

    setLoading(true)
    
    // Append manual selections to FormData
    formData.set('workout_frequency', selectedFrequency)
    formData.set('workout_duration', selectedDuration)
    formData.set('selected_proteins', JSON.stringify(selectedProteins))
    formData.set('selected_carbs', JSON.stringify(selectedCarbs))
    formData.set('selected_veggies', noVeggies ? '[]' : JSON.stringify(selectedVeggies))
    formData.set('selected_fruits', noFruits ? '[]' : JSON.stringify(selectedFruits))
    formData.set('no_veggies', noVeggies ? 'true' : 'false')
    formData.set('no_fruits', noFruits ? 'true' : 'false')

    try {
      const result = await saveDietPreferences(formData)
      if (result.success) {
        toast.success('Preferências salvas! Gerando sua dieta...')
        // Navegar para /dieta (sem reconfigure) para exibir o novo plano
        window.location.href = '/dieta'
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
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Vamos montar sua dieta personalizada</CardTitle>
          <CardDescription>
            Precisamos de alguns dados específicos para calcular suas calorias e macronutrientes com precisão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-8">
            <input type="hidden" name="userId" value={userId} />
            
            {/* 1. Biometrics */}
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

            {/* 2. Workout Frequency (Buttons) */}
            <div className="space-y-3">
              <Label>Frequência de Treino Semanal</Label>
              <div className="grid grid-cols-3 gap-2">
                {['1-2', '3-4', '5+'].map((freq) => (
                    <Button
                        key={freq}
                        type="button"
                        variant={selectedFrequency === freq ? 'default' : 'outline'}
                        onClick={() => setSelectedFrequency(freq)}
                        className="w-full"
                    >
                        {freq === '5+' ? '5+ vezes' : `${freq} vezes`}
                    </Button>
                ))}
              </div>
            </div>

            {/* 3. Workout Duration (Buttons) */}
            <div className="space-y-3">
              <Label>Duração do Treino (Nível)</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                    { val: '15', label: 'Iniciante (15m)' },
                    { val: '20', label: 'Intermed. (20m)' },
                    { val: '30', label: 'Avançado (30m)' }
                ].map((opt) => (
                    <Button
                        key={opt.val}
                        type="button"
                        variant={selectedDuration === opt.val ? 'default' : 'outline'}
                        onClick={() => setSelectedDuration(opt.val)}
                        className="w-full text-xs md:text-sm px-1"
                    >
                        {opt.label}
                    </Button>
                ))}
              </div>
            </div>

            {/* 4. Food Preferences (Checklists) */}
            <div className="space-y-6">
                <Label className="text-xl font-bold">Monte seu cardápio</Label>
                <p className="text-sm text-muted-foreground -mt-4">Selecione APENAS o que você gosta de comer. Sua dieta será baseada nessas escolhas.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Proteins */}
                    <div className="space-y-2 border p-4 rounded-lg">
                        <Label className="text-primary font-bold">Proteínas (Carnes/Ovos)</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {getFoodsByCategory('protein').map((item) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`p-${item.id}`} 
                                        checked={selectedProteins.includes(item.id)}
                                        onCheckedChange={() => toggleFood(item.id, selectedProteins, setSelectedProteins)}
                                    />
                                    <label htmlFor={`p-${item.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                        {item.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Carbs */}
                    <div className="space-y-2 border p-4 rounded-lg">
                        <Label className="text-primary font-bold">Carboidratos</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {getFoodsByCategory('carb').map((item) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`c-${item.id}`} 
                                        checked={selectedCarbs.includes(item.id)}
                                        onCheckedChange={() => toggleFood(item.id, selectedCarbs, setSelectedCarbs)}
                                    />
                                    <label htmlFor={`c-${item.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                        {item.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Veggies */}
                    <div className="space-y-2 border p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-primary font-bold">Vegetais / Saladas</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="no-veggies" checked={noVeggies} onCheckedChange={(c) => setNoVeggies(c as boolean)} />
                                <label htmlFor="no-veggies" className="text-xs text-muted-foreground cursor-pointer">Não gosto</label>
                            </div>
                        </div>
                        <div className={`grid grid-cols-1 gap-2 ${noVeggies ? 'opacity-50 pointer-events-none' : ''}`}>
                            {getFoodsByCategory('veg').map((item) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`v-${item.id}`} 
                                        checked={selectedVeggies.includes(item.id)}
                                        onCheckedChange={() => toggleFood(item.id, selectedVeggies, setSelectedVeggies)}
                                    />
                                    <label htmlFor={`v-${item.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                        {item.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fruits */}
                    <div className="space-y-2 border p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-primary font-bold">Frutas</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="no-fruits" checked={noFruits} onCheckedChange={(c) => setNoFruits(c as boolean)} />
                                <label htmlFor="no-fruits" className="text-xs text-muted-foreground cursor-pointer">Não gosto</label>
                            </div>
                        </div>
                        <div className={`grid grid-cols-1 gap-2 ${noFruits ? 'opacity-50 pointer-events-none' : ''}`}>
                            {getFoodsByCategory('fruit').map((item) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`f-${item.id}`} 
                                        checked={selectedFruits.includes(item.id)}
                                        onCheckedChange={() => toggleFood(item.id, selectedFruits, setSelectedFruits)}
                                    />
                                    <label htmlFor={`f-${item.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                        {item.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="water_bottle">Tamanho da sua garrafa de água (ml)</Label>
              <Input id="water_bottle" name="water_bottle_size_ml" type="number" required placeholder="Ex: 500" />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Calculando...' : 'Gerar Minha Dieta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
