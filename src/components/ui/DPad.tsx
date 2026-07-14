import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface DPadProps {
  onDirection: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void
}

export function DPad({ onDirection }: DPadProps) {
  const buttonClass = `
    w-14 h-14
    bg-brutal-gray
    border-4 border-brutal-black
    flex items-center justify-center
    text-brutal-white
    active:bg-arcade-yellow active:text-brutal-black
    active:translate-x-[2px] active:translate-y-[2px]
    transition-all duration-75
    cursor-pointer
    select-none
    touch-manipulation
  `

  return (
    <div className="md:hidden fixed bottom-8 left-8 z-50">
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-fit">
        {/* Top */}
        <div />
        <button
          className={buttonClass}
          onTouchStart={(e) => { e.preventDefault(); onDirection('UP') }}
          onMouseDown={() => onDirection('UP')}
          aria-label="Up"
        >
          <ChevronUp size={28} strokeWidth={4} />
        </button>
        <div />

        {/* Left */}
        <button
          className={buttonClass}
          onTouchStart={(e) => { e.preventDefault(); onDirection('LEFT') }}
          onMouseDown={() => onDirection('LEFT')}
          aria-label="Left"
        >
          <ChevronLeft size={28} strokeWidth={4} />
        </button>

        {/* Center */}
        <div className="w-14 h-14 bg-brutal-black border-4 border-brutal-black" />

        {/* Right */}
        <button
          className={buttonClass}
          onTouchStart={(e) => { e.preventDefault(); onDirection('RIGHT') }}
          onMouseDown={() => onDirection('RIGHT')}
          aria-label="Right"
        >
          <ChevronRight size={28} strokeWidth={4} />
        </button>

        {/* Bottom */}
        <div />
        <button
          className={buttonClass}
          onTouchStart={(e) => { e.preventDefault(); onDirection('DOWN') }}
          onMouseDown={() => onDirection('DOWN')}
          aria-label="Down"
        >
          <ChevronDown size={28} strokeWidth={4} />
        </button>
        <div />
      </div>
    </div>
  )
}
