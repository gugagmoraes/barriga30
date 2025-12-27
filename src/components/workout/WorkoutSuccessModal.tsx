import { Button } from '@/components/ui/button'
import { Trophy, Medal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CountUp } from '@/components/ui/count-up'
import { useEffect, useState } from 'react'

interface WorkoutSuccessModalProps {
  xpEarned: number
  newBadges: string[]
  onClose: () => void
}

const badgeTitles: Record<string, string> = {
  'first_workout': 'Primeiro Passo',
  'first_streak': 'Chama Acesa',
  'streak_3': 'Consistência',
  'streak_7': 'Imparável',
  'workouts_5': 'Aquecendo',
  'workouts_10': 'Atleta'
}

const successPhrases = [
    "Treino feito. Corpo agradece.",
    "Mais um dia vencido.",
    "Você apareceu hoje. Isso conta.",
    "Foco mantido com sucesso!",
    "Cada gota de suor é uma vitória.",
    "Amanhã você vai agradecer por hoje."
]

export function WorkoutSuccessModal({ xpEarned, newBadges, onClose }: WorkoutSuccessModalProps) {
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)
  const [phrase, setPhrase] = useState('')

  useEffect(() => {
    // Pick random phrase on mount
    setPhrase(successPhrases[Math.floor(Math.random() * successPhrases.length)])
    
    // Small delay to trigger entry animation smoothly
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleContinue = () => {
    // Force refresh ensures dashboard gets latest stats
    router.refresh()
    // Navigate to dashboard
    router.push('/dashboard')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center space-y-8 transform transition-all duration-500 ${showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10'}`}>
        
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Treino Concluído!</h2>
            <p className="text-gray-500 italic">"{phrase}"</p>
        </div>

        {/* XP Reward with CountUp */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm">
            <div className="bg-white p-3 rounded-full shadow-sm mb-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-4xl font-black text-yellow-600 font-mono tracking-tighter">
                +<CountUp end={xpEarned} /> XP
            </div>
        </div>

        {/* Badges */}
        {newBadges.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300 fill-mode-forwards opacity-0" style={{ animationDelay: '500ms' }}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nova Conquista</p>
                <div className="grid gap-3">
                    {newBadges.map(badge => (
                        <div key={badge} className="flex items-center gap-4 bg-purple-50 p-4 rounded-xl border-2 border-purple-100 transform hover:scale-105 transition-transform">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Medal className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-purple-900 text-lg">{badgeTitles[badge] || 'Nova Conquista'}</span>
                                <span className="text-xs text-purple-600 font-medium">Desbloqueado agora!</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <Button size="lg" className="w-full text-lg h-14 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95" onClick={handleContinue}>
            Continuar
        </Button>
      </div>
    </div>
  )
}
