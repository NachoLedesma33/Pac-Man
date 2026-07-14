import { useState, useCallback } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { Layout } from './components/layout/Layout'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { WelcomeScreen } from './components/game/WelcomeScreen'
import { ArcadeCabinet } from './components/arcade/ArcadeCabinet'
import { ScoreBoard } from './components/game/ScoreBoard'
import { DPad } from './components/ui/DPad'
import { Modal } from './components/ui/Modal'
import { ToastContainer, useToast } from './components/ui/Toast'
import { Settings, Pause, Play } from 'lucide-react'

type GameScreen = 'menu' | 'playing' | 'paused'

function App() {
  const [screen, setScreen] = useState<GameScreen>('menu')
  const [isPaused, setIsPaused] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [crtEnabled, setCrtEnabled] = useState(true)
  const { toasts, addToast, removeToast } = useToast()

  const handleStart = useCallback(() => {
    setScreen('playing')
    addToast('Juego Iniciado', '¡Buena suerte!', 'info')
  }, [addToast])

  const handlePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  const handleDirection = useCallback((direction: string) => {
    // Placeholder for game input - will be connected to game engine in Phase 3
    console.log('Direction:', direction)
  }, [])

  return (
    <ThemeProvider>
      <Layout>
        {screen === 'menu' ? (
          <WelcomeScreen onStart={handleStart} />
        ) : (
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Header */}
            <header className="flex items-center justify-between w-full max-w-2xl mb-4">
              <h1
                className="text-3xl md:text-5xl font-black text-arcade-yellow tracking-tighter"
                style={{
                  fontFamily: 'var(--font-display)',
                  textShadow: '3px 3px 0px #000, 5px 5px 0px #FFE600',
                }}
              >
                PAC-MAN
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePause}
                  className="
                    w-10 h-10
                    bg-brutal-gray
                    border-4 border-brutal-black
                    flex items-center justify-center
                    text-brutal-white
                    shadow-[3px_3px_0px_0px_#FFE600]
                    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                    transition-all duration-100
                    cursor-pointer
                  "
                  aria-label={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="
                    w-10 h-10
                    bg-brutal-gray
                    border-4 border-brutal-black
                    flex items-center justify-center
                    text-brutal-white
                    shadow-[3px_3px_0px_0px_#FFE600]
                    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                    transition-all duration-100
                    cursor-pointer
                  "
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
                <ThemeToggle />
              </div>
            </header>

            {/* Score Board */}
            <div className="w-full max-w-2xl mb-4">
              <ScoreBoard score={0} highScore={0} lives={3} level={1} />
            </div>

            {/* Arcade Cabinet */}
            <div className="w-full max-w-2xl">
              <ArcadeCabinet>
                {/* Game Canvas Placeholder */}
                <div className="w-full h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center bg-brutal-black">
                  {isPaused ? (
                    <div className="text-center">
                      <p
                        className="text-arcade-yellow text-4xl md:text-6xl font-black animate-pulse"
                        style={{ fontFamily: 'var(--font-display)', textShadow: '3px 3px 0px #000' }}
                      >
                        PAUSED
                      </p>
                      <p className="text-brutal-white text-sm mt-2">Presiona ESPACIO para continuar</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-arcade-yellow text-lg mb-2">ZONA DE JUEGO</p>
                      <p className="text-brutal-white text-xs opacity-60">Motor del juego se implementará en Fase 3</p>
                    </div>
                  )}
                </div>
              </ArcadeCabinet>
            </div>

            {/* D-Pad for mobile */}
            <DPad onDirection={handleDirection} />

            {/* Footer */}
            <footer className="mt-6 text-center text-xs opacity-40">
              <p>NEO-BRUTAL ARCADE EDITION</p>
            </footer>
          </div>
        )}

        {/* Settings Modal */}
        <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="AJUSTES">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-brutal-white text-sm font-bold">CRT Scanlines</label>
              <button
                onClick={() => setCrtEnabled(prev => !prev)}
                className={`
                  w-16 h-8
                  border-4 border-brutal-black
                  font-bold text-xs
                  transition-all duration-150
                  cursor-pointer
                  ${crtEnabled
                    ? 'bg-arcade-yellow text-brutal-black'
                    : 'bg-brutal-black text-brutal-white'
                  }
                `}
              >
                {crtEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="border-t-2 border-brutal-black pt-4">
              <p className="text-brutal-white text-xs opacity-60">
                Más ajustes se agregarán en fases futuras
              </p>
            </div>
          </div>
        </Modal>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* CRT Overlays */}
        {crtEnabled && (
          <>
            <div className="crt-overlay" />
            <div className="crt-vignette" />
          </>
        )}
      </Layout>
    </ThemeProvider>
  )
}

export default App
