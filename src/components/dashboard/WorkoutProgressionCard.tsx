'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Heart, Dumbbell } from 'lucide-react'
import Link from 'next/link'
import { WorkoutLevel } from '@/services/progression'
import { updateUserWorkoutLevel } from '@/app/actions/user'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProgressionCardProps {
  status: {
    currentLevel: WorkoutLevel
    progress: { A: number; B: number; C: number }
    canLevelUp: boolean
    nextLevelLocked: boolean
  }
  isCriticalMode: boolean
  plan: string // basic, plus, vip
}

export function WorkoutProgressionCard({ status, isCriticalMode, plan }: ProgressionCardProps) {
  const { currentLevel, progress, canLevelUp, nextLevelLocked } = status
  const [isPending, startTransition] = useTransition()

  const handleLevelChange = (value: string) => {
      const newLevel = value as WorkoutLevel
      if (newLevel === currentLevel) return
      startTransition(async () => {
          await updateUserWorkoutLevel(newLevel)
      })
  }

  const levelLabels: Record<string, string> = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado'
  }

  const isVipOrPlus = plan === 'vip' || plan === 'plus'

  // VIP Critical Mode Override
  if (isCriticalMode) {
    return (
      <Card className="bg-blue-50 border-blue-200 shadow-md">
        <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-blue-700">
                <Heart className="h-5 w-5 fill-blue-500 text-blue-500" />
                <CardTitle className="text-lg">Modo Dia Crítico Ativo</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-blue-600">
                Hoje vamos pegar leve. Esse treino conta para seu streak e mantém seu ritmo sem sobrecarregar.
            </p>
            <div className="bg-white p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-1">Treino Adaptado (Iniciante)</h4>
                <p className="text-xs text-gray-500 mb-3">Foco em mobilidade e bem-estar.</p>
                <Link href="/treinos?mode=critical">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Começar Treino Suave
                    </Button>
                </Link>
            </div>
        </CardContent>
      </Card>
    )
  }

  // Common Header with Selector
  const HeaderContent = () => {
    if (isVipOrPlus) {
        return (
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900">Seu Nível:</span>
                    <Select 
                        disabled={isPending} 
                        value={currentLevel} 
                        onValueChange={handleLevelChange}
                    >
                        <SelectTrigger className="w-[140px] h-8 font-bold border-gray-200 bg-white">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="beginner">Iniciante</SelectItem>
                            <SelectItem value="intermediate">Intermediário</SelectItem>
                            <SelectItem value="advanced">Avançado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-between items-center w-full">
            <CardTitle className="text-base font-bold text-gray-900">
                Seu Nível: {levelLabels[currentLevel]}
            </CardTitle>
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {currentLevel === 'advanced' ? 'Nível Máximo' : 'Próximo: ' + (levelLabels[Object.keys(levelLabels)[Object.keys(levelLabels).indexOf(currentLevel) + 1]] || 'Avançado')}
            </span>
        </div>
    )
  }

  // Level Up / Upgrade Block
  if (canLevelUp) {
    if (nextLevelLocked) {
        return (
            <Card className="bg-gray-50 border-gray-200 border-dashed shadow-sm">
                <CardHeader className="pb-2 border-b border-gray-50">
                    <HeaderContent />
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="bg-gray-200 p-3 rounded-full">
                        <Lock className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Nível Avançado Bloqueado</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
                            Você dominou o Intermediário! Para acessar treinos de elite, faça o upgrade do seu plano.
                        </p>
                    </div>
                    <Link href="/register?plan=plus" className="w-full">
                        <Button variant="default" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                            Desbloquear Agora
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-md">
            <CardHeader className="pb-2 border-b border-purple-100/50">
                <HeaderContent />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="bg-purple-100 p-3 rounded-full animate-bounce">
                    <Dumbbell className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-bold text-purple-900 text-lg">Novo nível desbloqueado 🎉</h3>
                    <p className="text-purple-700 text-sm max-w-xs mx-auto mt-1">
                        Seu corpo já está pronto para o próximo desafio.
                    </p>
                </div>
                <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                        Manter Atual
                    </Button>
                    {/* Action to change level via button */}
                    <Button 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                             const nextMap: Record<string, string> = {
                                'beginner': 'intermediate',
                                'intermediate': 'advanced',
                                'advanced': 'advanced'
                              };
                              handleLevelChange(nextMap[currentLevel] as WorkoutLevel)
                        }}
                        disabled={isPending}
                    >
                        {isPending ? 'Atualizando...' : 'Subir de Nível'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
  }

  // Standard Progression View
  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader className="pb-2 border-b border-gray-50">
        <HeaderContent />
      </CardHeader>
      <CardContent className="pt-6 pb-6">
            <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Progresso para subir de nível</span>
                    <span className="font-bold">{Math.min(100, Math.round((progress.A + progress.B + progress.C) / 12 * 100))}%</span>
                </div>
                <Progress value={Math.min(100, (progress.A + progress.B + progress.C) / 12 * 100)} className="h-3" />
                <p className="text-xs text-gray-400 text-center">
                    Complete seus treinos diários para desbloquear o próximo estágio.
                </p>
            </div>
      </CardContent>
    </Card>
  )
}
