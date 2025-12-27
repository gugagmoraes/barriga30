import { Medal, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BadgesCardProps {
  unlockedBadges: any[]
  allBadges: any[]
}

export function BadgesCard({ unlockedBadges, allBadges }: BadgesCardProps) {
  // Create a map of unlocked badge IDs for fast lookup
  const unlockedSet = new Set(unlockedBadges.map(ub => ub.badge_id))

  // Sort: Unlocked first, then by title
  const sortedBadges = [...allBadges].sort((a, b) => {
    const aUnlocked = unlockedSet.has(a.id)
    const bUnlocked = unlockedSet.has(b.id)
    if (aUnlocked && !bUnlocked) return -1
    if (!aUnlocked && bUnlocked) return 1
    return 0
  })

  // Show only first 6 for dashboard, maybe add "View All" later
  const displayBadges = sortedBadges.slice(0, 6)

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Medal className="h-4 w-4 text-purple-600" />
            Conquistas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
            {displayBadges.map(badge => {
                const isUnlocked = unlockedSet.has(badge.id)
                return (
                    <div 
                        key={badge.id} 
                        className={`
                            flex flex-col items-center justify-center p-2 rounded-lg text-center gap-1
                            ${isUnlocked ? 'bg-purple-50 border border-purple-100' : 'bg-gray-50 border border-gray-100 opacity-60'}
                        `}
                    >
                        <div className={`
                            p-2 rounded-full 
                            ${isUnlocked ? 'bg-purple-100' : 'bg-gray-200'}
                        `}>
                            {isUnlocked ? (
                                <Medal className="h-5 w-5 text-purple-600" />
                            ) : (
                                <Lock className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                        <span className="text-[10px] font-medium leading-tight text-gray-700">
                            {badge.title}
                        </span>
                    </div>
                )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
