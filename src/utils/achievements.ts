import type { Achievement, AchievementState, GameStats } from '../types/achievements'
import { ACHIEVEMENTS } from '../types/achievements'

const STORAGE_KEY = 'pacman-achievements'

export function loadAchievements(): AchievementState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { unlocked: [] }
}

export function saveAchievements(state: AchievementState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetAchievements(): AchievementState {
  const empty = { unlocked: [] }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(empty))
  return empty
}

export function checkAchievements(
  stats: GameStats,
  currentState: AchievementState
): { newlyUnlocked: Achievement[]; state: AchievementState } {
  const newlyUnlocked: Achievement[] = []
  const newState = { ...currentState, unlocked: [...currentState.unlocked] }

  for (const achievement of ACHIEVEMENTS) {
    if (!newState.unlocked.includes(achievement.id)) {
      if (achievement.condition(stats)) {
        newState.unlocked.push(achievement.id)
        newlyUnlocked.push(achievement)
      }
    }
  }

  if (newlyUnlocked.length > 0) {
    saveAchievements(newState)
  }

  return { newlyUnlocked, state: newState }
}
