import type { Pacman, Ghost, CellType, Position } from '../types/game'
import { GAME_CONFIG } from '../constants/game'

export function checkPacmanDotCollision(
  pacman: Pacman,
  map: CellType[][]
): { eaten: boolean; cellType: CellType | null; cellPos: Position | null } {
  const cellX = Math.round(pacman.position.x)
  const cellY = Math.round(pacman.position.y)

  if (cellX < 0 || cellX >= map[0].length || cellY < 0 || cellY >= map.length) {
    return { eaten: false, cellType: null, cellPos: null }
  }

  const dist = Math.abs(pacman.position.x - cellX) + Math.abs(pacman.position.y - cellY)

  if (dist < 0.4) {
    const cell = map[cellY][cellX]
    if (cell === 'DOT' || cell === 'POWER_PILL') {
      return { eaten: true, cellType: cell, cellPos: { x: cellX, y: cellY } }
    }
  }

  return { eaten: false, cellType: null, cellPos: null }
}

export function checkPacmanGhostCollision(
  pacman: Pacman,
  ghosts: Ghost[]
): { collided: boolean; ghostIndex: number; wasFrightened: boolean } {
  const collisionDistance = 0.8

  for (let i = 0; i < ghosts.length; i++) {
    const ghost = ghosts[i]
    if (ghost.isHome) continue

    const dist = Math.sqrt(
      (pacman.position.x - ghost.position.x) ** 2 +
      (pacman.position.y - ghost.position.y) ** 2
    )

    if (dist < collisionDistance) {
      return {
        collided: true,
        ghostIndex: i,
        wasFrightened: ghost.mode === 'FRIGHTENED',
      }
    }
  }

  return { collided: false, ghostIndex: -1, wasFrightened: false }
}

export function calculateGhostScore(comboCount: number): number {
  const index = Math.min(comboCount, GAME_CONFIG.POINTS.GHOST_COMBO.length - 1)
  return GAME_CONFIG.POINTS.GHOST_COMBO[index]
}
