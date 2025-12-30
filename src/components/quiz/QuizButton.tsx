import React from 'react'

interface QuizButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function QuizButton({ children, className = '', ...props }: QuizButtonProps) {
  return (
    <button
      className={`
        w-full py-4 rounded-full text-white font-bold text-lg tracking-wide
        transform transition-all duration-200 active:scale-95
        disabled:opacity-100 disabled:cursor-not-allowed
        bg-[#FE5846] hover:bg-[#e04f3f]
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
