import type { Pacman, Direction, CellType, Position } from '../types/game'
import { GAME_CONFIG } from '../constants/game'
import { canMove, wrapPosition } from './map'

export function createPacman(spawn: Position, speed: number): Pacman {
  return {
    position: { ...spawn },
    direction: 'LEFT',
    nextDirection: null,
    speed,
    mouthOpen: true,
    mouthAngle: 0,
  }
}

export function updatePacman(
  pacman: Pacman,
  map: CellType[][],
  deltaTime: number
): { pacman: Pacman; cellConsumed: Position | null } {
  const newPacman = { ...pacman }

  // Animate mouth
  newPacman.mouthAngle += deltaTime * 0.01
  if (newPacman.mouthAngle > Math.PI) {
    newPacman.mouthAngle = 0
    newPacman.mouthOpen = !newPacman.mouthOpen
  }

  // Try to change direction if nextDirection is set
  if (newPacman.nextDirection && newPacman.nextDirection !== newPacman.direction) {
    if (canMove(map, newPacman.position, newPacman.nextDirection)) {
      newPacman.direction = newPacman.nextDirection
      newPacman.nextDirection = null
    }
  }

  // Calculate movement based on speed and delta time
  const moveAmount = newPacman.speed * (deltaTime / 1000) * 8

  // Check if we can move in current direction
  if (canMove(map, newPacman.position, newPacman.direction)) {
    const offset = GAME_CONFIG.DIRECTIONS[newPacman.direction]
    newPacman.position = {
      x: newPacman.position.x + offset.x * moveAmount,
      y: newPacman.position.y + offset.y * moveAmount,
    }

    // Wrap through tunnels
    newPacman.position = wrapPosition(newPacman.position)
  }

  // Determine which cell Pac-Man is currently on (for dot consumption)
  const cellX = Math.round(newPacman.position.x)
  const cellY = Math.round(newPacman.position.y)
  let cellConsumed: Position | null = null

  // Check if Pac-Man is close enough to center of cell to consume
  const distToCenter = Math.abs(newPacman.position.x - cellX) + Math.abs(newPacman.position.y - cellY)
  if (distToCenter < 0.3 && cellX >= 0 && cellX < map[0].length && cellY >= 0 && cellY < map.length) {
    const cell = map[cellY][cellX]
    if (cell === 'DOT' || cell === 'POWER_PILL') {
      cellConsumed = { x: cellX, y: cellY }
    }
  }

  return { pacman: newPacman, cellConsumed }
}

export function setPacmanDirection(pacman: Pacman, direction: Direction): Pacman {
  return { ...pacman, nextDirection: direction }
}
