import type { Pacman, Direction, CellType, Position } from '../types/game'
import { GAME_CONFIG } from '../constants/game'
import { isWalkable } from './map'

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

function cellCenter(pos: Position): Position {
  return { x: Math.round(pos.x), y: Math.round(pos.y) }
}

function distToCenter(pos: Position): number {
  const center = cellCenter(pos)
  return Math.abs(pos.x - center.x) + Math.abs(pos.y - center.y)
}

export function updatePacman(
  pacman: Pacman,
  map: CellType[][],
  deltaTime: number
): { pacman: Pacman; cellConsumed: Position | null } {
  const newPacman = { ...pacman }

  // Animate mouth
  newPacman.mouthAngle += deltaTime * 0.006
  if (newPacman.mouthAngle > Math.PI) {
    newPacman.mouthAngle = 0
    newPacman.mouthOpen = !newPacman.mouthOpen
  }

  const center = cellCenter(newPacman.position)
  const atCenter = distToCenter(newPacman.position) < 0.02

  // Snap to center when very close
  if (atCenter) {
    newPacman.position = { ...center }
  }

  const currentCenter = cellCenter(newPacman.position)

  // At cell center: decide next direction and check if we can move
  if (distToCenter(newPacman.position) < 0.02) {
    // Try nextDirection first (pre-turn)
    if (newPacman.nextDirection && newPacman.nextDirection !== newPacman.direction) {
      const nx = currentCenter.x + GAME_CONFIG.DIRECTIONS[newPacman.nextDirection].x
      const ny = currentCenter.y + GAME_CONFIG.DIRECTIONS[newPacman.nextDirection].y
      if (isWalkable(map, nx, ny)) {
        newPacman.direction = newPacman.nextDirection
        newPacman.nextDirection = null
      }
    }

    // Check if current direction is blocked
    const fx = currentCenter.x + GAME_CONFIG.DIRECTIONS[newPacman.direction].x
    const fy = currentCenter.y + GAME_CONFIG.DIRECTIONS[newPacman.direction].y
    if (!isWalkable(map, fx, fy)) {
      // Blocked: stay at center
      newPacman.position = { ...currentCenter }
      return { pacman: newPacman, cellConsumed: null }
    }
  }

  // Speed: ms to cross one cell. Higher = slower.
  const cellTime = 180 / newPacman.speed
  const moveAmount = deltaTime / cellTime

  // Move toward next cell center
  const offset = GAME_CONFIG.DIRECTIONS[newPacman.direction]
  const targetX = currentCenter.x + offset.x
  const targetY = currentCenter.y + offset.y

  // Check if target cell is walkable
  if (!isWalkable(map, targetX, targetY)) {
    newPacman.position = { ...currentCenter }
    return { pacman: newPacman, cellConsumed: null }
  }

  // Move toward target, but never overshoot
  const dx = targetX - newPacman.position.x
  const dy = targetY - newPacman.position.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist <= moveAmount) {
    // Would reach or pass target - snap to target
    newPacman.position = { x: targetX, y: targetY }
  } else {
    // Move toward target
    const ratio = moveAmount / dist
    newPacman.position = {
      x: newPacman.position.x + dx * ratio,
      y: newPacman.position.y + dy * ratio,
    }
  }

  // Tunnel wrapping
  if (newPacman.position.x < -0.5) {
    newPacman.position = { x: map[0].length - 0.5, y: newPacman.position.y }
  } else if (newPacman.position.x > map[0].length - 0.5) {
    newPacman.position = { x: -0.5, y: newPacman.position.y }
  }

  // Dot consumption: only at exact cell center
  let cellConsumed: Position | null = null
  const finalCenter = cellCenter(newPacman.position)
  if (distToCenter(newPacman.position) < 0.02) {
    const cx = finalCenter.x
    const cy = finalCenter.y
    if (cx >= 0 && cx < map[0].length && cy >= 0 && cy < map.length) {
      const cell = map[cy][cx]
      if (cell === 'DOT' || cell === 'POWER_PILL') {
        cellConsumed = { x: cx, y: cy }
      }
    }
  }

  return { pacman: newPacman, cellConsumed }
}

export function setPacmanDirection(pacman: Pacman, direction: Direction): Pacman {
  return { ...pacman, nextDirection: direction }
}
