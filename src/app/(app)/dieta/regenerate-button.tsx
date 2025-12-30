'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { regenerateDietAction } from '@/app/actions/diet'
import { toast } from 'sonner'

interface RegenerateDietButtonProps {
  userId: string
  currentWeight: number
  currentHeight: number
  currentAge: number
}

export function RegenerateDietButton({ 
  userId, 
  currentWeight, 
  currentHeight, 
  currentAge 
}: RegenerateDietButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [weight, setWeight] = useState(currentWeight)
  const [height, setHeight] = useState(currentHeight)
  const [age, setAge] = useState(currentAge)

  const handleRegenerate = async () => {
    setLoading(true)
    try {
      const result = await regenerateDietAction({
        weight,
        height,
        age
      })

      if (result.success) {
        toast.success('Dieta atualizada com sucesso!')
        setOpen(false)
        window.location.reload() // Simple refresh to show new snapshot
      } else {
        toast.error(result.error || 'Erro ao atualizar dieta')
      }
    } catch (e) {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar Dieta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Plano Alimentar</DialogTitle>
          <DialogDescription>
            Seus dados mudaram? Atualize abaixo para recalcularmos suas metas calóricas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">Peso (kg)</Label>
            <Input 
                id="weight" 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(Number(e.target.value))} 
                className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="height" className="text-right">Altura (cm)</Label>
            <Input 
                id="height" 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(Number(e.target.value))} 
                className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right">Idade</Label>
            <Input 
                id="age" 
                type="number" 
                value={age} 
                onChange={(e) => setAge(Number(e.target.value))} 
                className="col-span-3" 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleRegenerate} disabled={loading}>
                {loading ? 'Gerando...' : 'Gerar Nova Dieta'}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
