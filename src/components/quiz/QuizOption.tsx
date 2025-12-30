import { Check } from 'lucide-react'

interface QuizOptionProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function QuizOption({ label, selected, onClick }: QuizOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-xl text-left font-medium text-lg transition-all duration-200
        flex items-center gap-4
        ${selected
          ? 'bg-[#1F6B75] text-white shadow-sm'
          : 'bg-[#F2F0EA] text-[#333] hover:bg-[#EBE9E3]'
        }
      `}
    >
      <div className={`
        w-6 h-6 rounded flex items-center justify-center border-2 transition-colors shrink-0
        ${selected 
          ? 'bg-white border-white' 
          : 'bg-white border-gray-300'
        }
      `}>
        {selected && <Check className="w-4 h-4 text-[#1F6B75]" strokeWidth={3} />}
      </div>
      <span className="leading-tight">{label}</span>
    </button>
  )
}
