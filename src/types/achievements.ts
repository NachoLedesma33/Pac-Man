export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: GameStats) => boolean
}

export interface GameStats {
  dotsEaten: number
  ghostsEaten: number
  powerPillsUsed: number
  maxCombo: number
  level: number
  lives: number
  score: number
}

export interface AchievementState {
  unlocked: string[]
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_bite',
    name: 'Primer Bocado',
    description: 'Come tu primer punto',
    icon: '🟡',
    condition: (stats) => stats.dotsEaten >= 1,
  },
  {
    id: 'ghost_hunter',
    name: 'Cazador de Fantasmas',
    description: 'Come un fantasma debilitado',
    icon: '👻',
    condition: (stats) => stats.ghostsEaten >= 1,
  },
  {
    id: 'power_absolute',
    name: 'Poder Absoluto',
    description: 'Usa las 4 píldoras de poder en una partida',
    icon: '💊',
    condition: (stats) => stats.powerPillsUsed >= 4,
  },
  {
    id: 'immune',
    name: 'Inmune',
    description: 'Completa un nivel sin perder vidas',
    icon: '🛡️',
    condition: (stats) => stats.level >= 2 && stats.lives === 3,
  },
  {
    id: 'combo_master',
    name: 'Maestro del Combo',
    description: 'Come 4 fantasmas seguidos con una píldora',
    icon: '🔥',
    condition: (stats) => stats.maxCombo >= 4,
  },
  {
    id: 'level_10',
    name: 'Veterano',
    description: 'Alcanza el nivel 10',
    icon: '🏆',
    condition: (stats) => stats.level >= 10,
  },
  {
    id: 'collector',
    name: 'Coleccionista',
    description: 'Come todos los puntos de un nivel',
    icon: '💎',
    condition: (stats) => stats.dotsEaten >= 240,
  },
  {
    id: 'high_scorer',
    name: 'Puntuación Alta',
    description: 'Alcanza 10,000 puntos',
    icon: '⭐',
    condition: (stats) => stats.score >= 10000,
  },
]
