import type { Pacman, Direction, CellType, Position } from '../types/game'
import { GAME_CONFIG } from '../constants/game'
import { canMove, isWalkable } from './map'

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

function isAtCellCenter(pos: Position): boolean {
  const eps = 0.05
  return Math.abs(pos.x - Math.round(pos.x)) < eps &&
         Math.abs(pos.y - Math.round(pos.y)) < eps
}

function snapToCell(pos: Position): Position {
  return {
    x: Math.round(pos.x),
    y: Math.round(pos.y),
  }
}

export function updatePacman(
  pacman: Pacman,
  map: CellType[][],
  deltaTime: number
): { pacman: Pacman; cellConsumed: Position | null } {
  const newPacman = { ...pacman }

  // Animate mouth
  newPacman.mouthAngle += deltaTime * 0.008
  if (newPacman.mouthAngle > Math.PI) {
    newPacman.mouthAngle = 0
    newPacman.mouthOpen = !newPacman.mouthOpen
  }

  // Movement: cells per second based on speed multiplier
  // Speed 1.0 = 8 cells/second at 1 cell per frame at 8fps... let's do simpler
  // moveAmount = speed * deltaTime / cellTime
  // We want Pac-Man to move smoothly between cells
  // At speed 1.0, it should take ~125ms to cross one cell
  const cellTime = 125 / newPacman.speed
  const moveAmount = deltaTime / cellTime

  const atCenter = isAtCellCenter(newPacman.position)

  if (atCenter) {
    // Snap to exact center
    newPacman.position = snapToCell(newPacman.position)

    // Try nextDirection first
    if (newPacman.nextDirection && canMove(map, newPacman.position, newPacman.nextDirection)) {
      newPacman.direction = newPacman.nextDirection
      newPacman.nextDirection = null
    }

    // Check if we can continue in current direction
    if (!canMove(map, newPacman.position, newPacman.direction)) {
      // Hit a wall - stop by snapping and returning
      return { pacman: newPacman, cellConsumed: null }
    }
  }

  // Move in current direction
  const offset = GAME_CONFIG.DIRECTIONS[newPacman.direction]
  let newX = newPacman.position.x + offset.x * moveAmount
  let newY = newPacman.position.y + offset.y * moveAmount

  // Check if we would pass through a wall
  const nextCellX = Math.round(newX + offset.x * 0.1)
  const nextCellY = Math.round(newY + offset.y * 0.1)

  if (!isWalkable(map, nextCellX, nextCellY)) {
    // Would hit wall - snap to current cell center
    newPacman.position = snapToCell(newPacman.position)
  } else {
    newPacman.position = { x: newX, y: newY }
  }

  // Handle tunnel wrapping
  if (newPacman.position.x < -0.5) {
    newPacman.position = { x: map[0].length - 0.5, y: newPacman.position.y }
  } else if (newPacman.position.x > map[0].length - 0.5) {
    newPacman.position = { x: -0.5, y: newPacman.position.y }
  }

  // Check dot consumption (only at cell center)
  const cellX = Math.round(newPacman.position.x)
  const cellY = Math.round(newPacman.position.y)
  let cellConsumed: Position | null = null

  if (isAtCellCenter(newPacman.position) &&
      cellX >= 0 && cellX < map[0].length &&
      cellY >= 0 && cellY < map.length) {
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
