import { Progress } from '@/components/ui/progress'
import { Flame, Trophy, Star } from 'lucide-react'

interface UserStatsProps {
  stats: {
    current_streak: number
    total_xp: number
    level: number
  }
  nextLevel: {
    level: number
    min_xp: number
    title: string
  } | null
  currentLevelTitle: string
}

export function UserStatsCard({ stats, nextLevel, currentLevelTitle }: UserStatsProps) {
  // Calculate progress percentage
  // If max level, 100%
  let progress = 100
  let xpForNextLevel = 0
  
  if (nextLevel) {
    // Simple logic: Progress is based on total XP relative to next level threshold
    // Or relative to current level bracket? Let's simplify: Total XP / Next Level Req
    // Actually, users want to see progress within the level.
    // Assuming level N starts at X and N+1 starts at Y.
    // For MVP, simple Total XP / Next Level Target is fine, but might look weird if levels are exponential.
    // Let's stick to simple % of target for now.
    progress = Math.min(100, Math.round((stats.total_xp / nextLevel.min_xp) * 100))
    xpForNextLevel = nextLevel.min_xp - stats.total_xp
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <Flame className={`h-8 w-8 mb-2 ${stats.current_streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
            <span className="text-2xl font-bold text-gray-900">{stats.current_streak}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Dias seguidos</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
            <span className="text-2xl font-bold text-gray-900">{stats.total_xp}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Total XP</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-2">
            <div>
                <span className="text-xs text-gray-400 uppercase tracking-wide">Nível {stats.level}</span>
                <div className="font-bold text-gray-900 flex items-center gap-2">
                    {currentLevelTitle}
                </div>
            </div>
            {nextLevel && (
                <span className="text-xs text-gray-500 text-right">
                    Faltam {xpForNextLevel} XP para<br/>
                    <span className="font-semibold text-primary">{nextLevel.title}</span>
                </span>
            )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  )
}
