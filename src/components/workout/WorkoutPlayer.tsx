'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react'
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
    exercises?: Exercise[] // If null, assume full video without structured exercises for MVP
}

export default function WorkoutPlayer({ workout }: { workout: Workout }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)
    const [isResting, setIsResting] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [earnedXP, setEarnedXP] = useState(0)
    const [newBadges, setNewBadges] = useState<string[]>([])
    
    const router = useRouter()
    
    // Default exercises if not provided
    const exercises = workout.exercises || [
        { name: 'Aquecimento', duration: 30 },
        { name: 'Exercicio 1', duration: 45 },
        { name: 'Descanso', duration: 15 },
        { name: 'Exercicio 2', duration: 45 },
        { name: 'Exercicio 3', duration: 45 },
        { name: 'Resfriamento', duration: 30 },
    ]

    useEffect(() => {
        if (isResting) {
            setTimeLeft(10) // 10s rest/prep
        } else {
            setTimeLeft(exercises[currentExerciseIndex].duration)
        }
    }, [currentExerciseIndex, isResting, exercises])

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isPlaying && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0 && isPlaying) {
            // Timer finished
            if (isResting) {
                setIsResting(false)
            } else {
                if (currentExerciseIndex < exercises.length - 1) {
                    setIsResting(true)
                    setCurrentExerciseIndex((prev) => prev + 1)
                } else {
                    setIsPlaying(false)
                    // Workout finished!
                    if (!isCompleted) {
                        setIsCompleted(true)
                        handleCompletion()
                    }
                }
            }
        }
        return () => clearInterval(interval)
    }, [isPlaying, timeLeft, isResting, currentExerciseIndex, exercises.length, isCompleted])

    const handleCompletion = async () => {
        try {
            const result = await completeWorkout(workout.id)
            if (result.success) {
                setEarnedXP(result.xpEarned || 0)
                setNewBadges(result.newBadges || [])
                setShowSuccessModal(true)
            } else {
                 alert('Treino concluído, mas houve um erro ao salvar o progresso.')
            }
        } catch (error) {
            console.error('Failed to log completion', error)
        }
    }

    const togglePlay = () => setIsPlaying(!isPlaying)
    
    const nextExercise = () => {
        setIsResting(false)
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1)
        }
    }

    const prevExercise = () => {
        setIsResting(false)
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(prev => prev - 1)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
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

            {/* Video Placeholder */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
                <div className="text-center px-4">
                    <h2 className="text-xl md:text-2xl font-bold mb-8 text-gray-400">{workout.name}</h2>
                    {isResting ? (
                         <div className="bg-white/5 p-8 rounded-2xl border border-white/10 animate-pulse">
                             <p className="text-xl font-bold text-primary">PREPARE-SE</p>
                             <p className="text-6xl font-mono mt-4">{timeLeft}s</p>
                             <p className="text-sm mt-6 text-gray-300">Próximo: <span className="text-white font-bold">{exercises[currentExerciseIndex].name}</span></p>
                         </div>
                    ) : (
                         <div>
                             <p className="text-3xl md:text-4xl font-bold mb-4">{exercises[currentExerciseIndex].name}</p>
                             <p className="text-7xl md:text-9xl font-mono font-bold text-primary tabular-nums">{formatTime(timeLeft)}</p>
                         </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="h-24 bg-gray-800 flex items-center justify-between px-6 md:px-12 z-20">
                 <Button variant="ghost" onClick={prevExercise} disabled={currentExerciseIndex === 0} className="text-white hover:bg-white/10">
                     <RotateCcw className="h-6 w-6" />
                 </Button>
                 
                 <Button 
                    size="icon" 
                    className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg scale-110"
                    onClick={togglePlay}
                 >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                 </Button>

                 <Button variant="ghost" onClick={nextExercise} disabled={currentExerciseIndex === exercises.length - 1} className="text-white hover:bg-white/10">
                     <SkipForward className="h-6 w-6" />
                 </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-gray-700 w-full absolute bottom-24 left-0 z-10">
                <div 
                    className="h-full bg-primary transition-all duration-1000 ease-linear" 
                    style={{ width: `${((currentExerciseIndex + (isResting ? 0 : (1 - timeLeft/exercises[currentExerciseIndex].duration))) / exercises.length) * 100}%` }}
                />
            </div>
        </div>
    )
}
