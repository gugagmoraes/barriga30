'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipForward, RotateCcw, CheckCircle, ArrowDownCircle } from 'lucide-react'
import { completeWorkout } from '@/app/actions/workout'
import { useRouter } from 'next/navigation'
import { WorkoutSuccessModal } from './WorkoutSuccessModal'
import Script from 'next/script'

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
    duration_minutes?: number | null
    exercises?: Exercise[] 
}

export default function WorkoutPlayer({
    workout,
    regression,
    initialCompletedToday,
    planType
}: {
    workout: Workout
    regression?: Workout | null
    initialCompletedToday?: boolean
    planType?: string
}) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isCompleted, setIsCompleted] = useState(!!initialCompletedToday)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [earnedXP, setEarnedXP] = useState(0)
    const [newBadges, setNewBadges] = useState<string[]>([])
    const [playerJsReady, setPlayerJsReady] = useState(false)
    const [canComplete, setCanComplete] = useState(false)
    const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const router = useRouter()
    
    const rawUrl = workout.video_url || workout.link_youtube || null
    const embedUrl = useMemo(() => {
        if (!rawUrl) return null

        if (rawUrl.includes('youtube.com') && rawUrl.includes('v=')) {
             const videoId = rawUrl.split('v=')[1]?.split('&')[0]
             return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0`
        }

        if (rawUrl.includes('youtu.be/')) {
             const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0]
             return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0`
        }

        try {
            const parsed = new URL(rawUrl)
            if (parsed.hostname.endsWith('mediadelivery.net') && parsed.pathname.startsWith('/embed/')) {
                parsed.searchParams.set('autoplay', isPlaying ? 'true' : 'false')
                parsed.searchParams.set('v', workout.id)
                return parsed.toString()
            }
        } catch {}

        return rawUrl
    }, [isPlaying, rawUrl, workout.id])

    const isBunnyEmbed = useMemo(() => {
        if (!embedUrl) return false
        try {
            const parsed = new URL(embedUrl)
            return parsed.hostname.endsWith('mediadelivery.net') && parsed.pathname.startsWith('/embed/')
        } catch {
            return false
        }
    }, [embedUrl])

    useEffect(() => {
        if (!embedUrl) {
            setCanComplete(false)
            setSecondsRemaining(null)
            return
        }

        if (!isBunnyEmbed) {
            setCanComplete(true)
            setSecondsRemaining(null)
            return
        }

        setCanComplete(false)
        setSecondsRemaining(null)
        if (!playerJsReady) return
        if (!iframeRef.current) return

        const w = window as any
        const playerjs = w?.playerjs
        if (!playerjs?.Player) return

        const player = new playerjs.Player(iframeRef.current)

        const handleTimeupdate = (payload: any) => {
            let data = payload
            if (typeof payload === 'string') {
                try { data = JSON.parse(payload) } catch { return }
            }
            const seconds = typeof data?.seconds === 'number' ? data.seconds : NaN
            const duration = typeof data?.duration === 'number' ? data.duration : NaN
            if (!Number.isFinite(seconds) || !Number.isFinite(duration) || duration <= 0) return
            const remaining = Math.max(0, Math.ceil(duration - seconds))
            setSecondsRemaining(remaining)
            setCanComplete(remaining <= 60)
        }

        const handleEnded = () => {
            setSecondsRemaining(0)
            setCanComplete(true)
        }

        player.on('ready', () => {
            player.on('timeupdate', handleTimeupdate)
            player.on('ended', handleEnded)
        })

        return () => {
            try { player.off('timeupdate', handleTimeupdate) } catch {}
            try { player.off('ended', handleEnded) } catch {}
            try { player.off('ready') } catch {}
        }
    }, [embedUrl, isBunnyEmbed, playerJsReady])

    const handleCompletion = async () => {
        try {
            if (!canComplete || isCompleted) return
            const result = await completeWorkout(workout.id)
            if (result.success) {
                setEarnedXP(result.xpEarned || 0)
                setNewBadges(result.newBadges || [])
                setShowSuccessModal(true)
                setIsCompleted(true)
                router.refresh()
            } else {
                 if ((result as any).error === 'duplicate') {
                    alert('Você já concluiu este treino hoje.')
                 } else {
                    alert('Não foi possível salvar seu progresso agora. Tente novamente.')
                 }
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

            {isCompleted && (
                <div className="absolute top-4 left-4 z-30 bg-green-600/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                    Você já concluiu este treino hoje. Parabéns!
                </div>
            )}

            {/* Regression Option */}
            {regression && (
                <div className="absolute top-4 right-4 z-30">
                     <Button 
                        variant="secondary" 
                        size="sm" 
                        className="bg-white/90 hover:bg-white text-black text-xs font-semibold shadow-lg backdrop-blur-sm"
                        onClick={() => {
                            if (planType === 'basic') {
                                router.push('/upgrade')
                                return
                            }
                            if (!regression?.id) {
                                alert('Nenhuma versão mais leve disponível agora.')
                                return
                            }
                            router.push(`/treinos/${regression.id}`)
                        }}
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
                        {isBunnyEmbed && (
                            <Script
                                src="https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js"
                                strategy="afterInteractive"
                                onLoad={() => setPlayerJsReady(true)}
                            />
                        )}
                        <iframe 
                            src={embedUrl}
                            title={workout.name} 
                            ref={iframeRef}
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
                <div className="flex-1" />

                {(isCompleted || canComplete) && (
                    <Button 
                        size="lg" 
                        className={`font-bold px-8 ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}`}
                        onClick={handleCompletion}
                        disabled={isCompleted || !canComplete}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Treino Concluído Hoje
                            </>
                        ) : (
                            'Marcar como Concluído'
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}
