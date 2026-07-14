import { useState, useCallback } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { Layout } from './components/layout/Layout'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { WelcomeScreen } from './components/game/WelcomeScreen'
import { ArcadeCabinet } from './components/arcade/ArcadeCabinet'
import { ScoreBoard } from './components/game/ScoreBoard'
import { GameBoard } from './components/game/GameBoard'
import { DPad } from './components/ui/DPad'
import { Modal } from './components/ui/Modal'
import { ToastContainer, useToast } from './components/ui/Toast'
import { useGameState } from './hooks/useGameState'
import { useGameLoop } from './hooks/useGameLoop'
import { useKeyboard } from './hooks/useKeyboard'
import { Settings, Pause, Play, RotateCcw } from 'lucide-react'
import type { Direction, Difficulty } from './types/game'

type GameScreen = 'menu' | 'playing' | 'gameover'

function App() {
  const [screen, setScreen] = useState<GameScreen>('menu')
  const [showSettings, setShowSettings] = useState(false)
  const [crtEnabled, setCrtEnabled] = useState(true)
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL')
  const { toasts, addToast, removeToast } = useToast()

  const {
    gameState,
    startGame,
    togglePause,
    setDirection,
    updateGame,
  } = useGameState()

  // Game loop
  useGameLoop({
    callback: updateGame,
    isRunning: gameState.isPlaying && !gameState.isPaused && screen === 'playing',
  })

  // Keyboard input
  const handleDirection = useCallback((dir: Direction) => {
    setDirection(dir)
  }, [setDirection])

  const handleAction = useCallback((action: 'PAUSE' | 'START') => {
    if (action === 'PAUSE' && screen === 'playing') {
      togglePause()
    }
  }, [screen, togglePause])

  useKeyboard({
    onDirection: handleDirection,
    onAction: handleAction,
    enabled: screen === 'playing',
  })

  // Handle game over
  const handleStart = useCallback(() => {
    startGame(difficulty)
    setScreen('playing')
    addToast('Juego Iniciado', `Dificultad: ${difficulty}`, 'info')
  }, [startGame, difficulty, addToast])

  const handleRestart = useCallback(() => {
    startGame(difficulty)
    setScreen('playing')
    addToast('Juego Reiniciado', `Dificultad: ${difficulty}`, 'info')
  }, [startGame, difficulty, addToast])

  // Check for game over
  if (screen === 'playing' && gameState.isGameOver) {
    setTimeout(() => {
      setScreen('gameover')
      addToast('Game Over', `Puntuación: ${gameState.score}`, 'info')
    }, 1000)
  }

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
                  onClick={togglePause}
                  className="
                    w-10 h-10 bg-brutal-gray border-4 border-brutal-black
                    flex items-center justify-center text-brutal-white
                    shadow-[3px_3px_0px_0px_#FFE600]
                    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                    transition-all duration-100 cursor-pointer
                  "
                  aria-label={gameState.isPaused ? 'Resume' : 'Pause'}
                >
                  {gameState.isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="
                    w-10 h-10 bg-brutal-gray border-4 border-brutal-black
                    flex items-center justify-center text-brutal-white
                    shadow-[3px_3px_0px_0px_#FFE600]
                    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                    transition-all duration-100 cursor-pointer
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
              <ScoreBoard
                score={gameState.score}
                highScore={gameState.highScore}
                lives={gameState.lives}
                level={gameState.level}
              />
            </div>

            {/* Arcade Cabinet */}
            <div className="w-full max-w-2xl">
              <ArcadeCabinet>
                {gameState.isGameOver ? (
                  <div className="w-full h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center bg-brutal-black">
                    <div className="text-center">
                      <p
                        className="text-ghost-red text-4xl md:text-6xl font-black"
                        style={{ fontFamily: 'var(--font-display)', textShadow: '3px 3px 0px #000' }}
                      >
                        GAME OVER
                      </p>
                      <p className="text-arcade-yellow text-xl mt-4 font-bold">
                        Puntuación: {gameState.score}
                      </p>
                      <button
                        onClick={handleRestart}
                        className="
                          mt-6 px-6 py-3
                          bg-arcade-yellow text-brutal-black
                          border-4 border-brutal-black
                          font-bold text-lg
                          shadow-[4px_4px_0px_0px_#000]
                          active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                          transition-all duration-100 cursor-pointer
                          flex items-center gap-2 mx-auto
                        "
                      >
                        <RotateCcw size={20} />
                        REINICIAR
                      </button>
                    </div>
                  </div>
                ) : gameState.isPaused ? (
                  <div className="w-full h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center bg-brutal-black">
                    <p
                      className="text-arcade-yellow text-4xl md:text-6xl font-black animate-pulse"
                      style={{ fontFamily: 'var(--font-display)', textShadow: '3px 3px 0px #000' }}
                    >
                      PAUSED
                    </p>
                  </div>
                ) : (
                  <GameBoard gameState={gameState} />
                )}
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
                  w-16 h-8 border-4 border-brutal-black font-bold text-xs
                  transition-all duration-150 cursor-pointer
                  ${crtEnabled ? 'bg-arcade-yellow text-brutal-black' : 'bg-brutal-black text-brutal-white'}
                `}
              >
                {crtEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-brutal-white text-sm font-bold">Dificultad</label>
              <div className="flex gap-1">
                {(['EASY', 'NORMAL', 'HARDCORE'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`
                      px-3 py-1 border-2 border-brutal-black font-bold text-xs
                      transition-all duration-100 cursor-pointer
                      ${difficulty === d
                        ? 'bg-arcade-yellow text-brutal-black'
                        : 'bg-brutal-black text-brutal-white'
                      }
                    `}
                  >
                    {d === 'EASY' ? 'FÁCIL' : d === 'NORMAL' ? 'NORMAL' : 'HARDCORE'}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t-2 border-brutal-black pt-4">
              <p className="text-brutal-white text-xs opacity-60">
                Los ajustes se aplicarán en la siguiente partida
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
