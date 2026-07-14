import { useState, useCallback, useEffect, useRef } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { Layout } from './components/layout/Layout'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { WelcomeScreen } from './components/game/WelcomeScreen'
import { ArcadeCabinet } from './components/arcade/ArcadeCabinet'
import { ScoreBoard } from './components/game/ScoreBoard'
import { GameBoard } from './components/game/GameBoard'
import { AchievementPanel } from './components/game/AchievementPanel'
import { Leaderboard, NameInput } from './components/game/Leaderboard'
import { DPad } from './components/ui/DPad'
import { Modal } from './components/ui/Modal'
import { ToastContainer, useToast } from './components/ui/Toast'
import { useGameState } from './hooks/useGameState'
import { useGameLoop } from './hooks/useGameLoop'
import { useKeyboard } from './hooks/useKeyboard'
import { useAchievements } from './hooks/useAchievements'
import { useLeaderboard } from './components/game/Leaderboard'
import { useSound } from './hooks/useSound'
import { Settings, Pause, Play, RotateCcw, Trophy, Award, Volume2, VolumeX } from 'lucide-react'
import type { Direction, Difficulty } from './types/game'

type GameScreen = 'menu' | 'playing' | 'gameover'

function App() {
  const [screen, setScreen] = useState<GameScreen>('menu')
  const [showSettings, setShowSettings] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [crtEnabled, setCrtEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL')
  const { toasts, addToast, removeToast } = useToast()

  const {
    gameState,
    gameStats,
    startGame,
    togglePause,
    setDirection,
    updateGame,
  } = useGameState()

  const { state: achievementState, check, pendingToasts, popToast } = useAchievements()
  const { entries: leaderboardEntries, addEntry, isHighScore } = useLeaderboard()
  const sound = useSound()
  const [showNameInput, setShowNameInput] = useState(false)

  // Track previous game state for sound triggers
  const prevGameState = useRef(gameState)

  // Sound effects based on game events
  useEffect(() => {
    if (!soundEnabled) return

    // Dot eaten
    if (gameState.score > prevGameState.current.score && !gameState.isGameOver) {
      sound.waka()
      sound.vibrate(50)
    }

    // Power pill
    if (gameState.frightenedTimeRemaining > 0 && prevGameState.current.frightenedTimeRemaining === 0) {
      sound.powerPill()
      sound.vibrate(100)
    }

    // Ghost eaten
    if (gameStats.ghostsEaten > (prevGameState.current as any).prevGhostsEaten) {
      sound.eatGhost()
      sound.vibrate(200)
    }

    // Level complete
    if (gameState.level > prevGameState.current.level) {
      sound.levelComplete()
      sound.vibrate([100, 50, 100])
    }

    // Death
    if (gameState.lives < prevGameState.current.lives && !gameState.isGameOver) {
      sound.death()
      sound.vibrate([200, 100, 200])
    }

    // Game over
    if (gameState.isGameOver && !prevGameState.current.isGameOver) {
      sound.gameOver()
      sound.vibrate([300, 100, 300, 100, 300])
    }

    prevGameState.current = gameState
  }, [gameState, gameStats, soundEnabled, sound])

  // Achievement sound
  useEffect(() => {
    if (pendingToasts.length > 0 && soundEnabled) {
      sound.achievement()
      sound.vibrate([50, 50, 50, 50, 100])
    }
  }, [pendingToasts, soundEnabled, sound])

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
      if (soundEnabled) sound.pause()
    }
  }, [screen, togglePause, soundEnabled, sound])

  useKeyboard({
    onDirection: handleDirection,
    onAction: handleAction,
    enabled: screen === 'playing',
  })

  // Check achievements
  useEffect(() => {
    if (screen === 'playing' && gameState.isPlaying) {
      check(gameStats)
    }
  }, [gameStats, screen, gameState.isPlaying, check])

  // Handle achievement toasts
  useEffect(() => {
    if (pendingToasts.length > 0) {
      const achievement = pendingToasts[0]
      addToast(`🏆 ${achievement.name}`, achievement.description, 'achievement')
      popToast()
    }
  }, [pendingToasts, addToast, popToast])

  // Handle game start
  const handleStart = useCallback(() => {
    sound.resume()
    startGame(difficulty)
    setScreen('playing')
    if (soundEnabled) sound.startGame()
    addToast('Juego Iniciado', `Dificultad: ${difficulty}`, 'info')
  }, [startGame, difficulty, soundEnabled, sound, addToast])

  const handleRestart = useCallback(() => {
    startGame(difficulty)
    setScreen('playing')
    if (soundEnabled) sound.startGame()
    addToast('Juego Reiniciado', `Dificultad: ${difficulty}`, 'info')
  }, [startGame, difficulty, soundEnabled, sound, addToast])

  // Check for game over
  useEffect(() => {
    if (screen === 'playing' && gameState.isGameOver) {
      const timer = setTimeout(() => {
        setScreen('gameover')
        addToast('Game Over', `Puntuación: ${gameState.score}`, 'info')
        if (isHighScore(gameState.score)) {
          setShowNameInput(true)
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [screen, gameState.isGameOver, gameState.score, addToast, isHighScore])

  const handleNameSubmit = useCallback((initials: string) => {
    addEntry(gameState.score, gameState.level, initials)
    setShowNameInput(false)
    setShowLeaderboard(true)
    addToast('Guardado', `Puntuación guardada como ${initials}`, 'score')
  }, [gameState.score, gameState.level, addEntry, addToast])

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
                  onClick={() => setShowAchievements(true)}
                  className="
                    w-10 h-10 bg-brutal-gray border-4 border-brutal-black
                    flex items-center justify-center text-brutal-white
                    shadow-[3px_3px_0px_0px_#FFE600]
                    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                    transition-all duration-100 cursor-pointer
                  "
                  aria-label="Achievements"
                >
                  <Award size={18} />
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="
                    w-10 h-10 bg-brutal-gray border-4 border-brutal-black
                    flex items-center justify-center text-brutal-white
                    shadow-[3px_3px_0px_0px_#FFE600]
                    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                    transition-all duration-100 cursor-pointer
                  "
                  aria-label="Leaderboard"
                >
                  <Trophy size={18} />
                </button>
                <button
                  onClick={() => setSoundEnabled(prev => !prev)}
                  className={`
                    w-10 h-10 border-4 border-brutal-black
                    flex items-center justify-center
                    shadow-[3px_3px_0px_0px_#FFE600]
                    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                    transition-all duration-100 cursor-pointer
                    ${soundEnabled ? 'bg-brutal-gray text-brutal-white' : 'bg-ghost-red text-brutal-white'}
                  `}
                  aria-label={soundEnabled ? 'Mute' : 'Unmute'}
                >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
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
                        Puntuación: {gameState.score.toLocaleString()}
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
                          hover:bg-arcade-yellow-dark
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
              <label className="text-brutal-white text-sm font-bold">Sonido</label>
              <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className={`
                  w-16 h-8 border-4 border-brutal-black font-bold text-xs
                  transition-all duration-150 cursor-pointer
                  ${soundEnabled ? 'bg-arcade-yellow text-brutal-black' : 'bg-brutal-black text-brutal-white'}
                `}
              >
                {soundEnabled ? 'ON' : 'OFF'}
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
          </div>
        </Modal>

        {/* Achievements Modal */}
        <Modal isOpen={showAchievements} onClose={() => setShowAchievements(false)} title="LOGROS">
          <AchievementPanel achievementState={achievementState} />
        </Modal>

        {/* Leaderboard Modal */}
        <Modal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} title="TOP SCORES">
          <Leaderboard entries={leaderboardEntries} onClose={() => setShowLeaderboard(false)} />
        </Modal>

        {/* Name Input */}
        <NameInput
          isOpen={showNameInput}
          onSubmit={handleNameSubmit}
          onCancel={() => setShowNameInput(false)}
        />

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
