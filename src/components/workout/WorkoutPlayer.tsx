'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipForward, RotateCcw, CheckCircle } from 'lucide-react'
import { completeWorkout } from '@/app/actions/workout'
import { useRouter } from 'next/navigation'
import { WorkoutSuccessModal } from './WorkoutSuccessModal'

// Define types
interface Exercise {
    name: string
    duration: number // seconds
}

interface Workout {
    id: string
    name: string
    video_url?: string | null
    exercises?: Exercise[] // If null, assume full video without structured exercises for MVP
}

export default function WorkoutPlayer({ workout }: { workout: Workout }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [earnedXP, setEarnedXP] = useState(0)
    const [newBadges, setNewBadges] = useState<string[]>([])
    
    // Video Embed Logic
    // If video_url is present, we show the embed. Otherwise placeholder.
    const videoId = workout.video_url ? workout.video_url.split('v=')[1] : null
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0` : null

    const handleCompletion = async () => {
        try {
            const result = await completeWorkout(workout.id)
            if (result.success) {
                setEarnedXP(result.xpEarned || 0)
                setNewBadges(result.newBadges || [])
                setShowSuccessModal(true)
                setIsCompleted(true)
            } else {
                 alert('Treino concluído, mas houve um erro ao salvar o progresso.')
            }
        } catch (error) {
            console.error('Failed to log completion', error)
        }
    }

    return (
        <div className="flex flex-col h-full bg-black text-white rounded-xl overflow-hidden relative">
            {showSuccessModal && (
                <WorkoutSuccessModal 
                    xpEarned={earnedXP} 
                    newBadges={newBadges} 
                    onClose={() => setShowSuccessModal(false)} 
                />
            )}

            {/* Video Area */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
                {embedUrl ? (
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={embedUrl} 
                        title={workout.name} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                ) : (
                    <div className="text-center px-4 space-y-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white">{workout.name}</h2>
                        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md mx-auto">
                            <p className="text-gray-400 mb-4">
                                Este treino é um vídeo guiado. 
                                <br/>O link do vídeo será inserido em breve.
                            </p>
                            <p className="text-sm text-gray-500 italic">
                                (Placeholder Técnico: Aguardando URL do YouTube)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="h-24 bg-gray-800 flex items-center justify-between px-6 md:px-12 z-20 border-t border-gray-700">
                 <div className="text-sm text-gray-400">
                    {isCompleted ? 'Treino Concluído ✅' : 'Assista ao vídeo e siga os movimentos'}
                 </div>
                 
                 <Button 
                    size="lg" 
                    className={`font-bold px-8 ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}`}
                    onClick={handleCompletion}
                    disabled={isCompleted}
                 >
                    {isCompleted ? (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Concluído
                        </>
                    ) : (
                        'Marcar como Concluído'
                    )}
                 </Button>
            </div>
        </div>
    )
}
