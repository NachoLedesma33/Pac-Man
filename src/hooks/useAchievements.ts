import { useState, useCallback, useEffect } from 'react'
import type { Achievement, AchievementState, GameStats } from '../types/achievements'
import { loadAchievements, checkAchievements } from '../utils/achievements'

export function useAchievements() {
  const [state, setState] = useState<AchievementState>(() => loadAchievements())
  const [pendingToasts, setPendingToasts] = useState<Achievement[]>([])

  useEffect(() => {
    setState(loadAchievements())
  }, [])

  const check = useCallback((stats: GameStats) => {
    const { newlyUnlocked, state: newState } = checkAchievements(stats, state)
    if (newlyUnlocked.length > 0) {
      setState(newState)
      setPendingToasts(prev => [...prev, ...newlyUnlocked])
    }
  }, [state])

  const popToast = useCallback(() => {
    setPendingToasts(prev => prev.slice(1))
  }, [])

  const getUnlockedCount = useCallback(() => {
    return state.unlocked.length
  }, [state])

  const isUnlocked = useCallback((id: string) => {
    return state.unlocked.includes(id)
  }, [state])

  return {
    state,
    check,
    pendingToasts,
    popToast,
    getUnlockedCount,
    isUnlocked,
  }
}
