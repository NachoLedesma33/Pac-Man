export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export type Position = {
  x: number
  y: number
}

export type CellType =
  | 'WALL'
  | 'PATH'
  | 'DOT'
  | 'POWER_PILL'
  | 'GHOST_HOUSE'
  | 'GHOST_DOOR'
  | 'EMPTY'
  | 'PACMAN_SPAWN'

export type GhostMode = 'CHASE' | 'SCATTER' | 'FRIGHTENED' | 'EATEN'

export type GhostName = 'BLINKY' | 'PINKY' | 'INKY' | 'CLYDE'

export type Difficulty = 'EASY' | 'NORMAL' | 'HARDCORE'

export interface Entity {
  position: Position
  direction: Direction
  nextDirection: Direction | null
  speed: number
}

export interface Ghost extends Entity {
  name: GhostName
  color: string
  mode: GhostMode
  previousMode: GhostMode
  scatterTarget: Position
  isHome: boolean
  homeTimer: number
  frightenedTimer: number
}

export interface Pacman extends Entity {
  mouthOpen: boolean
  mouthAngle: number
}

export interface GameState {
  pacman: Pacman
  ghosts: Ghost[]
  map: CellType[][]
  score: number
  highScore: number
  lives: number
  level: number
  difficulty: Difficulty
  isPlaying: boolean
  isPaused: boolean
  isGameOver: boolean
  dotsRemaining: number
  totalDots: number
  comboCount: number
  frightenedTimeRemaining: number
  modeTimer: number
  isChaseMode: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

export interface DifficultySettings {
  pacmanSpeed: number
  ghostSpeed: number
  frightenedSpeed: number
  frightenedDuration: number
  startingLives: number
}
