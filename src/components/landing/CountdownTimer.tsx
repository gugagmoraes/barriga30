'use client'

import React, { useState, useEffect } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Set a fixed future date for the demo, e.g., 2 days from now
    // In a real app, this would come from a config or backend
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 2) // 2 days from now
    targetDate.setHours(23, 59, 59)

    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date()
      let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      }

      return timeLeft
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const TimeBox = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg p-2 min-w-[60px] md:min-w-[80px]">
      <span className="text-2xl md:text-3xl font-black text-white leading-none">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] md:text-xs font-bold text-white/90 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )

  return (
    <div className="flex gap-2 md:gap-4 justify-center py-2">
      <TimeBox value={timeLeft.days} label="Dias" />
      <span className="text-2xl md:text-3xl font-bold text-white/50 self-start mt-1">:</span>
      <TimeBox value={timeLeft.hours} label="Horas" />
      <span className="text-2xl md:text-3xl font-bold text-white/50 self-start mt-1">:</span>
      <TimeBox value={timeLeft.minutes} label="Min" />
      <span className="text-2xl md:text-3xl font-bold text-white/50 self-start mt-1">:</span>
      <TimeBox value={timeLeft.seconds} label="Seg" />
    </div>
  )
}
