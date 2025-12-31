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
import { uploadProgressPhoto } from '@/app/actions/progress'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'

export function AddPhotoDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
        const result = await uploadProgressPhoto(formData)
        if (result.success) {
            toast.success('Foto salva com sucesso!')
            setOpen(false)
        } else {
            toast.error('Erro ao salvar foto.')
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
            <Camera className="mr-2 h-4 w-4" /> Adicionar Foto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Foto de Progresso</DialogTitle>
          <DialogDescription>
            Tire uma foto no espelho para comparar sua evolução.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="photo">Foto</Label>
                <Input id="photo" name="photo" type="file" accept="image/*" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Input id="notes" name="notes" placeholder="Ex: Manhã em jejum" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Salvar Foto'}
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
