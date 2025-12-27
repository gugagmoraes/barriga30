import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Star, Trophy } from 'lucide-react'
import { RankingEntry } from '@/services/ranking'

interface RankingListProps {
  entries: RankingEntry[]
  currentUserId: string
}

export function RankingList({ entries, currentUserId }: RankingListProps) {
  // Find current user rank
  const userRankIndex = entries.findIndex(e => e.user_id === currentUserId)
  const userEntry = userRankIndex !== -1 ? entries[userRankIndex] : null
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null

  const isTop10 = userRank && userRank <= 10
  const headerMessage = isTop10 
    ? "Você está entre as mais consistentes da semana 🎉" 
    : "Continue. A constância vence."

  return (
    <Card className="border-gray-100 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2 border-b border-gray-50">
        <div className="flex justify-between items-center">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Ranking Semanal
            </CardTitle>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Reseta Domingo</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{headerMessage}</p>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        {entries.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
                Seja a primeira a pontuar esta semana!
            </div>
        ) : (
            <div className="divide-y divide-gray-50">
                {entries.map((entry, index) => {
                    const rank = index + 1
                    const isCurrentUser = entry.user_id === currentUserId
                    const isVip = entry.plan === 'vip' || entry.plan === 'plus' // Treat Plus as VIP visual for now or strict VIP

                    // Highlight styles
                    let bgClass = "bg-white hover:bg-gray-50"
                    if (isCurrentUser) bgClass = "bg-purple-50 hover:bg-purple-100 sticky top-0 bottom-0 z-10 shadow-sm border-y border-purple-100"
                    
                    // Rank Medal
                    let rankIcon = <span className="font-mono text-gray-400 w-5 text-center text-sm">{rank}</span>
                    if (rank === 1) rankIcon = <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    if (rank === 2) rankIcon = <span className="font-bold text-gray-600 text-lg">2</span>
                    if (rank === 3) rankIcon = <span className="font-bold text-amber-700 text-lg">3</span>

                    return (
                        <div key={entry.user_id} className={`flex items-center gap-3 p-3 transition-colors ${bgClass}`}>
                            <div className="flex-shrink-0 w-6 flex justify-center">
                                {rankIcon}
                            </div>
                            
                            <Avatar className="h-8 w-8 border border-gray-100">
                                <AvatarImage src="" /> {/* Future: entry.avatar_url */}
                                <AvatarFallback className="text-xs bg-gray-100 text-gray-500">
                                    {entry.name?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-purple-900' : 'text-gray-900'}`}>
                                        {isCurrentUser ? 'Você' : (entry.name || 'Usuário')}
                                    </p>
                                    {isVip && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="block text-sm font-bold text-gray-700">{entry.weekly_xp} XP</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </CardContent>
      
      {/* Sticky User Footer if not in view (Optional UX refinement, skipping for MVP simplicity) */}
    </Card>
  )
}
