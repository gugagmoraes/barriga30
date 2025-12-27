'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type QuizState = {
  // BLOCO 1
  objective: string | null
  
  // BLOCO 2
  name: string | null
  weight: number | null
  targetWeight: number | null // Added target weight
  height: number | null
  age: number | null
  gender: string | null
  
  // BLOCO 3
  bodyParts: string[]
  
  // BLOCO 4
  consciousnessLevel: string | null
  
  // BLOCO 5
  medicalConditions: string[]
  familyHistory: string[]
  
  // BLOCO 6
  workoutTime: string | null
  workoutFrequency: string | null
  
  // BLOCO 7
  dietHabits: string | null
  
  // BLOCO 8
  proteinPrefs: string[]
  carbPrefs: string[]
  veggiePrefs: string[]
  prepStyle: string | null
  
  // BLOCO 9
  dreams: string[]
  mainChange: string | null
  
  // BLOCO 10
  barriers: string[]
}

type QuizContextType = {
  state: QuizState
  updateState: (updates: Partial<QuizState>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

const INITIAL_STATE: QuizState = {
  objective: null,
  name: null,
  weight: null,
  targetWeight: null,
  height: null,
  age: null,
  gender: null,
  bodyParts: [],
  consciousnessLevel: null,
  medicalConditions: [],
  familyHistory: [],
  workoutTime: null,
  workoutFrequency: null,
  dietHabits: null,
  proteinPrefs: [],
  carbPrefs: [],
  veggiePrefs: [],
  prepStyle: null,
  dreams: [],
  mainChange: null,
  barriers: []
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>(INITIAL_STATE)
  const [currentStep, setCurrentStep] = useState(0)

  // Persist state to localStorage on changes
  useEffect(() => {
    const savedState = localStorage.getItem('barriga30_quiz_official')
    if (savedState) {
      try {
        setState(JSON.parse(savedState))
      } catch (e) {
        console.error('Failed to parse saved quiz state', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('barriga30_quiz_official', JSON.stringify(state))
  }, [state])

  const updateState = (updates: Partial<QuizState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  return (
    <QuizContext.Provider value={{ state, updateState, currentStep, setCurrentStep }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}
