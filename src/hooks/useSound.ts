import { useCallback, useRef } from 'react'
import {
  resumeAudio,
  playWaka,
  playPowerPill,
  playEatGhost,
  playDeath,
  playLevelComplete,
  playGameOver,
  playStartGame,
  playPause,
  playAchievement,
} from '../utils/soundManager'

export function useSound() {
  const lastWakaRef = useRef<number>(0)

  const resume = useCallback(() => {
    resumeAudio()
  }, [])

  const waka = useCallback(() => {
    const now = Date.now()
    if (now - lastWakaRef.current > 50) {
      playWaka()
      lastWakaRef.current = now
    }
  }, [])

  const powerPill = useCallback(() => playPowerPill(), [])
  const eatGhost = useCallback(() => playEatGhost(), [])
  const death = useCallback(() => playDeath(), [])
  const levelComplete = useCallback(() => playLevelComplete(), [])
  const gameOver = useCallback(() => playGameOver(), [])
  const startGame = useCallback(() => playStartGame(), [])
  const pause = useCallback(() => playPause(), [])
  const achievement = useCallback(() => playAchievement(), [])

  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }, [])

  return {
    resume,
    waka,
    powerPill,
    eatGhost,
    death,
    levelComplete,
    gameOver,
    startGame,
    pause,
    achievement,
    vibrate,
  }
}
