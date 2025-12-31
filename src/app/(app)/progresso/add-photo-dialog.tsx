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
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const file = formData.get('photo') as File
    
    if (file && file.size > 0) {
        // Convert to base64 immediately for server action stability
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
            const base64 = reader.result as string
            formData.set('photo_base64', base64) // Pass base64 string instead of file object to server action if needed
            // Actually, server actions can handle FormData with Files now, but let's check the action.
            // If the action expects a file, we pass formData directly.
            // If the action was failing, let's try debugging the action first.
            // But usually the issue is Next.js server action file handling limits (1MB default).
            // Let's assume the action handles it, but we need to ensure the form submits correctly.
            
            try {
                const result = await uploadProgressPhoto(formData)
                if (result.success) {
                    toast.success('Foto salva com sucesso!')
                    setOpen(false)
                } else {
                    toast.error('Erro ao salvar foto: ' + (result.error || 'Desconhecido'))
                }
            } catch (err) {
                toast.error('Erro inesperado.')
            } finally {
                setLoading(false)
            }
        }
        reader.onerror = () => {
            toast.error('Erro ao ler arquivo.')
            setLoading(false)
        }
    } else {
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
