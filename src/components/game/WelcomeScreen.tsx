import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Gamepad2, Keyboard, Ghost, Zap } from 'lucide-react'

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [blinkVisible, setBlinkVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setBlinkVisible(prev => !prev), 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-brutal-black">
      {/* Marquee Title */}
      <div className="relative mb-8">
        <h1
          className="text-5xl md:text-8xl font-black text-arcade-yellow tracking-wider"
          style={{
            fontFamily: 'var(--font-display)',
            textShadow: '4px 4px 0px #FF0000, 8px 8px 0px #000',
          }}
        >
          PAC-MAN
        </h1>
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-arcade-yellow" />
        <div className="absolute -bottom-4 left-0 right-0 h-1 bg-ghost-red" />
      </div>

      {/* Animated Pac-Man */}
      <div className="mb-8 flex items-center gap-2">
        <div className="text-6xl md:text-8xl text-arcade-yellow animate-pulse">
          {'ᗧ'}
        </div>
        <div className="flex gap-2 text-3xl md:text-5xl">
          <span className="text-ghost-red animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
          <span className="text-ghost-pink animate-bounce" style={{ animationDelay: '100ms' }}>●</span>
          <span className="text-ghost-cyan animate-bounce" style={{ animationDelay: '200ms' }}>●</span>
          <span className="text-ghost-orange animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
        </div>
      </div>

      {/* Controls Section */}
      <div className="w-full max-w-md mb-8">
        <div className="border-4 border-brutal-black bg-brutal-gray p-4 shadow-[6px_6px_0px_0px_#FFE600]">
          <h2 className="text-arcade-yellow font-bold text-lg mb-3 flex items-center gap-2">
            <Keyboard size={20} />
            CONTROLES
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border-2 border-brutal-black bg-brutal-black p-2">
              <span className="text-brutal-white">← → ↑ ↓</span>
            </div>
            <div className="border-2 border-brutal-black bg-brutal-black p-2">
              <span className="text-brutal-white">W A S D</span>
            </div>
            <div className="border-2 border-brutal-black bg-brutal-black p-2">
              <span className="text-brutal-white">ESPACIO</span>
              <span className="text-arcade-yellow text-xs block">PAUSA</span>
            </div>
            <div className="border-2 border-brutal-black bg-brutal-black p-2">
              <span className="text-brutal-white">ENTER</span>
              <span className="text-arcade-yellow text-xs block">ACEPTAR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="w-full max-w-md mb-8">
        <div className="border-4 border-brutal-black bg-brutal-gray p-4 shadow-[6px_6px_0px_0px_#FF0000]">
          <h2 className="text-ghost-cyan font-bold text-lg mb-3 flex items-center gap-2">
            <Ghost size={20} />
            TIPS
          </h2>
          <ul className="space-y-2 text-sm text-brutal-white">
            <li className="flex items-start gap-2">
              <span className="text-arcade-yellow">▸</span>
              <span>Las <strong className="text-ghost-cyan">píldoras de poder</strong> te dan 6 segundos de ventaja</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arcade-yellow">▸</span>
              <span>Los fantasmas huyen cuando eres <strong className="text-arcade-yellow">poderoso</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arcade-yellow">▸</span>
              <span>Cada fantasma tiene un <strong className="text-ghost-pink">patrón único</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arcade-yellow">▸</span>
              <span>Los combos dan más puntos: <strong className="text-arcade-yellow">200→400→800→1600</strong></span>
            </li>
          </ul>
        </div>
      </div>

      {/* Insert Coin Button */}
      <div className="relative">
        <Button size="lg" onClick={onStart}>
          <Gamepad2 className="inline mr-2" size={24} />
          INSERT COIN
        </Button>
        <p
          className={`text-center text-arcade-yellow text-sm mt-3 font-bold transition-opacity duration-200 ${
            blinkVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          PRESIONA PARA JUGAR
        </p>
      </div>

      {/* High Score */}
      <div className="mt-8 text-center">
        <p className="text-brutal-white text-xs opacity-60 mb-1">HIGH SCORE</p>
        <p
          className="text-arcade-yellow text-2xl font-black"
          style={{ fontFamily: 'var(--font-mono)', textShadow: '2px 2px 0px #000' }}
        >
          0000000
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center gap-2 text-xs text-brutal-white opacity-40">
        <Zap size={12} />
        <span>NEO-BRUTAL ARCADE EDITION</span>
        <Zap size={12} />
      </div>
    </div>
  )
}
