import type { DifficultySettings } from '../types/game'

export const GAME_CONFIG = {
  CELL_SIZE: 24,
  FPS: 60,

  POINTS: {
    DOT: 10,
    POWER_PILL: 50,
    GHOST_COMBO: [200, 400, 800, 1600],
    LEVEL_COMPLETE: 1000,
  },

  TIMING: {
    SCATTER_DURATION: 7000,
    CHASE_DURATION: 20000,
    GHOST_HOME_DELAY: [0, 0, 3000, 5000],
  },

  DIRECTIONS: {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
  },

  DIFFICULTY: {
    EASY: {
      pacmanSpeed: 0.8,
      ghostSpeed: 0.6,
      frightenedSpeed: 0.4,
      frightenedDuration: 10000,
      startingLives: 5,
    } as DifficultySettings,
    NORMAL: {
      pacmanSpeed: 1.0,
      ghostSpeed: 0.9,
      frightenedSpeed: 0.45,
      frightenedDuration: 6000,
      startingLives: 3,
    } as DifficultySettings,
    HARDCORE: {
      pacmanSpeed: 1.1,
      ghostSpeed: 1.1,
      frightenedSpeed: 0.55,
      frightenedDuration: 3000,
      startingLives: 3,
    } as DifficultySettings,
  },

  COLORS: {
    BLINKY: '#FF0000',
    PINKY: '#FFB8FF',
    INKY: '#00FFFF',
    CLYDE: '#FFB852',
    FRIGHTENED: '#2121DE',
    FRIGHTENED_FLASH: '#FFFFFF',
    EATEN: '#FFFFFF',
  },

  getLevelSettings(base: DifficultySettings, level: number): DifficultySettings {
    const l = Math.min(level - 1, 20)
    return {
      ...base,
      pacmanSpeed: base.pacmanSpeed + l * 0.02,
      ghostSpeed: base.ghostSpeed + l * 0.04,
      frightenedSpeed: base.frightenedSpeed + l * 0.01,
      frightenedDuration: Math.max(1000, base.frightenedDuration - l * 300),
    }
  },

  getScatterDuration(level: number): number {
    return Math.max(3000, 7000 - (level - 1) * 300)
  },

  getChaseDuration(level: number): number {
    return Math.min(30000, 20000 + (level - 1) * 500)
  },
} as const
