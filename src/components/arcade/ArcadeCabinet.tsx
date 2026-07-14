import type { ReactNode } from 'react'

interface ArcadeCabinetProps {
  children: ReactNode
  className?: string
}

export function ArcadeCabinet({ children, className = '' }: ArcadeCabinetProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Marquee - Top of cabinet */}
      <div
        className="
          bg-arcade-yellow
          border-4 border-brutal-black
          border-b-0
          py-2 px-4
          text-center
          shadow-[0_-4px_0px_0px_#FF0000]
        "
      >
        <h2
          className="text-brutal-black text-xl md:text-2xl font-black tracking-widest"
          style={{
            fontFamily: 'var(--font-display)',
            textShadow: '2px 2px 0px #CCB800',
          }}
        >
          ★ PAC-MAN ARCADE ★
        </h2>
      </div>

      {/* Cabinet Body */}
      <div
        className="
          bg-brutal-gray
          border-4 border-brutal-black
          p-4 md:p-6
          shadow-[8px_8px_0px_0px_#FFE600]
        "
      >
        {/* Screen Bezel */}
        <div
          className="
            bg-brutal-black
            border-4 border-brutal-black
            p-2
            shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]
          "
        >
          {/* Screen */}
          <div
            className="
              relative
              bg-brutal-black
              aspect-video
              overflow-hidden
            "
          >
            {children}

            {/* CRT Scanlines */}
            <div className="crt-overlay" />
            <div className="crt-vignette" />
          </div>
        </div>

        {/* Control Panel - Below screen */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Coin Slot */}
          <div className="border-2 border-brutal-black bg-brutal-black p-2 text-center">
            <p className="text-arcade-yellow text-xs font-bold">INSERT COIN</p>
            <div className="mt-1 border border-brutal-white/30 rounded-sm h-4 w-16 mx-auto" />
          </div>

          {/* Credit */}
          <div className="border-2 border-brutal-black bg-brutal-black p-2 text-center">
            <p className="text-ghost-cyan text-xs font-bold">CREDIT</p>
            <p className="text-brutal-white text-lg font-black">00</p>
          </div>
        </div>
      </div>

      {/* Cabinet Base */}
      <div
        className="
          h-4
          bg-brutal-gray
          border-4 border-brutal-black
          border-t-0
          rounded-b-lg
        "
      />
    </div>
  )
}
