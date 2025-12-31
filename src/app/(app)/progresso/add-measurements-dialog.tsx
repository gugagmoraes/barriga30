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
import { addMeasurements } from '@/app/actions/progress'
import { toast } from 'sonner'
import { Ruler } from 'lucide-react'

export function AddMeasurementsDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const data = {
        waist: Number(formData.get('waist')),
        hips: Number(formData.get('hips')),
        bust: Number(formData.get('bust')),
        thigh: Number(formData.get('thigh')),
        arm: Number(formData.get('arm')),
    }

    try {
        const result = await addMeasurements(data)
        if (result.success) {
            toast.success('Medidas registradas!')
            setOpen(false)
        } else {
            toast.error('Erro ao salvar medidas.')
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
        <Button variant="outline" size="sm">
            <Ruler className="mr-2 h-4 w-4" /> Registrar Medidas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Medidas Corporais</DialogTitle>
          <DialogDescription>
            Acompanhe suas mudanças em centímetros.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="waist">Cintura (cm)</Label>
                    <Input id="waist" name="waist" type="number" step="0.1" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hips">Quadril (cm)</Label>
                    <Input id="hips" name="hips" type="number" step="0.1" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bust">Busto (cm)</Label>
                    <Input id="bust" name="bust" type="number" step="0.1" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="thigh">Coxa (cm)</Label>
                    <Input id="thigh" name="thigh" type="number" step="0.1" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="arm">Braço (cm)</Label>
                    <Input id="arm" name="arm" type="number" step="0.1" />
                </div>
            </div>
            <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Medidas'}
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
