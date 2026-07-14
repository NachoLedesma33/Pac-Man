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

function getCurrentCell(pos: Position, direction: Direction): Position {
  const roundX = Math.round(pos.x)
  const roundY = Math.round(pos.y)
  if (Math.abs(pos.x - roundX) < 0.02 && Math.abs(pos.y - roundY) < 0.02) {
    return { x: roundX, y: roundY }
  }
  switch (direction) {
    case 'RIGHT': return { x: Math.floor(pos.x), y: roundY }
    case 'LEFT':  return { x: Math.ceil(pos.x), y: roundY }
    case 'DOWN':  return { x: roundX, y: Math.floor(pos.y) }
    case 'UP':    return { x: roundX, y: Math.ceil(pos.y) }
    default:      return { x: roundX, y: roundY }
  }
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

  // Snap to center when very close
  if (distToCenter(newPacman.position) < 0.02) {
    newPacman.position = { ...cellCenter(newPacman.position) }
  }

  const atCenter = distToCenter(newPacman.position) < 0.02

  // At cell center: decide next direction and check if we can move
  if (atCenter) {
    const cc = cellCenter(newPacman.position)

    // Try nextDirection first (pre-turn)
    if (newPacman.nextDirection && newPacman.nextDirection !== newPacman.direction) {
      const nx = cc.x + GAME_CONFIG.DIRECTIONS[newPacman.nextDirection].x
      const ny = cc.y + GAME_CONFIG.DIRECTIONS[newPacman.nextDirection].y
      if (isWalkable(map, nx, ny)) {
        newPacman.direction = newPacman.nextDirection
        newPacman.nextDirection = null
      }
    }

    // Check if current direction is blocked
    const fx = cc.x + GAME_CONFIG.DIRECTIONS[newPacman.direction].x
    const fy = cc.y + GAME_CONFIG.DIRECTIONS[newPacman.direction].y
    if (!isWalkable(map, fx, fy)) {
      newPacman.position = { ...cc }
      return { pacman: newPacman, cellConsumed: null }
    }
  }

  // Current cell based on direction (not Math.round which is wrong between cells)
  const currentCell = getCurrentCell(newPacman.position, newPacman.direction)

  // Speed: ms to cross one cell. Higher = slower.
  const cellTime = 180 / newPacman.speed
  const moveAmount = deltaTime / cellTime

  // Move toward next cell center
  const offset = GAME_CONFIG.DIRECTIONS[newPacman.direction]
  const targetX = currentCell.x + offset.x
  const targetY = currentCell.y + offset.y

  // Check if target cell is walkable
  if (!isWalkable(map, targetX, targetY)) {
    newPacman.position = { x: currentCell.x, y: currentCell.y }
    return { pacman: newPacman, cellConsumed: null }
  }

  // Move toward target, but never overshoot
  const dx = targetX - newPacman.position.x
  const dy = targetY - newPacman.position.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist <= moveAmount) {
    newPacman.position = { x: targetX, y: targetY }
  } else {
    const ratio = moveAmount / dist
    newPacman.position = {
      x: newPacman.position.x + dx * ratio,
      y: newPacman.position.y + dy * ratio,
    }
  }

  // Tunnel wrapping: only at tunnel row (y=14)
  const px = Math.round(newPacman.position.x)
  const py = Math.round(newPacman.position.y)
  if (py === 14) {
    if (px <= 0 && newPacman.direction === 'LEFT') {
      newPacman.position = { x: map[0].length - 1, y: newPacman.position.y }
    } else if (px >= map[0].length - 1 && newPacman.direction === 'RIGHT') {
      newPacman.position = { x: 0, y: newPacman.position.y }
    }
  }

  // Dot consumption: check current cell every frame
  let cellConsumed: Position | null = null
  const cx = Math.round(newPacman.position.x)
  const cy = Math.round(newPacman.position.y)
  if (cx >= 0 && cx < map[0].length && cy >= 0 && cy < map.length) {
    const cell = map[cy][cx]
    if (cell === 'DOT' || cell === 'POWER_PILL') {
      cellConsumed = { x: cx, y: cy }
    }
  }

  return { pacman: newPacman, cellConsumed }
}

export function setPacmanDirection(pacman: Pacman, direction: Direction): Pacman {
  return { ...pacman, nextDirection: direction }
}
