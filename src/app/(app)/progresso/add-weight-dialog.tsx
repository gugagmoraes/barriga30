'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { addWeightRecord } from '@/app/actions/progress'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export function AddWeightDialog() {
  const [open, setOpen] = useState(false)
  const [weight, setWeight] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
        const result = await addWeightRecord(Number(weight))
        if (result.success) {
            toast.success('Peso registrado!')
            setOpen(false)
            setWeight('')
        } else {
            toast.error('Erro ao salvar peso.')
        }
    } catch (e) {
        toast.error('Erro inesperado.')
    } finally {
        setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <Plus className="mr-2 h-4 w-4" /> Registrar Peso
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Novo Peso</DialogTitle>
          <DialogDescription>
            Acompanhe sua evolução registrando seu peso regularmente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input 
                    id="weight" 
                    type="number" 
                    step="0.1" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)} 
                    required 
                    placeholder="Ex: 70.5"
                />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
