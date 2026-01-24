'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipForward, RotateCcw, CheckCircle, ArrowDownCircle } from 'lucide-react'
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
    link_youtube?: string | null // Fallback field
    exercises?: Exercise[] 
}

export default function WorkoutPlayer({ workout, regression }: { workout: Workout, regression?: Workout | null }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [earnedXP, setEarnedXP] = useState(0)
    const [newBadges, setNewBadges] = useState<string[]>([])
    const router = useRouter()
    
    // Video Embed Logic
    let embedUrl: string | null = null
    const rawUrl = workout.video_url || workout.link_youtube || null

    if (rawUrl) {
        if (rawUrl.includes('youtube.com') && rawUrl.includes('v=')) {
             const videoId = rawUrl.split('v=')[1]?.split('&')[0]
             embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0`
        } else if (rawUrl.includes('youtu.be/')) {
             const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0]
             embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0`
        } else {
             // Direct embed url (Bunny.net or other)
             embedUrl = rawUrl
             if (isPlaying && embedUrl.includes('mediadelivery.net')) {
                 const separator = embedUrl.includes('?') ? '&' : '?'
                 embedUrl = `${embedUrl}${separator}autoplay=true`
             }
        }
    }

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

            {/* Regression Option */}
            {regression && (
                <div className="absolute top-4 right-4 z-30">
                     <Button 
                        variant="secondary" 
                        size="sm" 
                        className="bg-white/90 hover:bg-white text-black text-xs font-semibold shadow-lg backdrop-blur-sm"
                        onClick={() => router.push(`/treinos/${regression.id}`)}
                     >
                        <ArrowDownCircle className="w-4 h-4 mr-2 text-orange-500" />
                        Está difícil? Fazer versão mais leve
                     </Button>
                </div>
            )}

            {/* Video Area */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
                {embedUrl ? (
                    <div className="w-full h-full relative">
                        <iframe 
                            src={embedUrl}
                            title={workout.name} 
                            className="w-full h-full absolute inset-0"
                            style={{ border: 'none' }}
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
                            allowFullScreen={true}
                        ></iframe>
                        {/* Debug Info (Hidden in Production usually, but helpful now) */}
                        {/* <div className="absolute top-0 left-0 bg-black/50 text-xs text-white p-1 z-50">
                            URL: {embedUrl}
                        </div> */}
                    </div>
                ) : (
                    <div className="text-center px-4 space-y-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white">{workout.name}</h2>
                        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md mx-auto">
                            <p className="text-gray-400 mb-4">
                                Este treino é um vídeo guiado. 
                                <br/>O link do vídeo será inserido em breve.
                            </p>
                            <div className="text-xs text-gray-500 font-mono bg-black/30 p-2 rounded text-left overflow-auto max-h-24">
                                <p>Debug Info:</p>
                                <p>ID: {workout.id}</p>
                                <p>Name: {workout.name}</p>
                                <p>Has Video URL: {workout.video_url ? 'Yes' : 'No'}</p>
                                <p>Has YouTube Link: {workout.link_youtube ? 'Yes' : 'No'}</p>
                                {rawUrl && <p className="break-all">Raw URL: {rawUrl}</p>}
                                {embedUrl && <p className="break-all">Embed URL: {embedUrl}</p>}
                            </div>
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
