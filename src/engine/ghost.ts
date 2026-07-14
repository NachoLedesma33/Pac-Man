import type { Ghost, GhostName, GhostMode, Direction, Position, CellType } from '../types/game'
import { GAME_CONFIG } from '../constants/game'
import { GHOST_SPAWNS, GHOST_SCATTER_TARGETS } from '../constants/map'
import { getAvailableDirections, distance, getOppositeDirection, isGhostWalkable } from './map'

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

export function createGhost(
  name: GhostName,
  speed: number,
  homeDelay: number
): Ghost {
  const spawn = GHOST_SPAWNS[name]
  return {
    position: { ...spawn },
    direction: 'LEFT',
    nextDirection: null,
    speed,
    name,
    color: GAME_CONFIG.COLORS[name],
    mode: 'SCATTER',
    previousMode: 'SCATTER',
    scatterTarget: GHOST_SCATTER_TARGETS[name],
    isHome: name !== 'BLINKY',
    homeTimer: homeDelay,
    frightenedTimer: 0,
  }
}

function getChaseTarget(
  ghost: Ghost,
  pacmanPos: Position,
  pacmanDir: Direction,
  blinkyPos: Position
): Position {
  switch (ghost.name) {
    case 'BLINKY':
      return pacmanPos
    case 'PINKY': {
      const offset = GAME_CONFIG.DIRECTIONS[pacmanDir]
      return {
        x: pacmanPos.x + offset.x * 4,
        y: pacmanPos.y + offset.y * 4,
      }
    }
    case 'INKY': {
      const offset = GAME_CONFIG.DIRECTIONS[pacmanDir]
      const ahead = {
        x: pacmanPos.x + offset.x * 2,
        y: pacmanPos.y + offset.y * 2,
      }
      return {
        x: ahead.x + (ahead.x - blinkyPos.x),
        y: ahead.y + (ahead.y - blinkyPos.y),
      }
    }
    case 'CLYDE': {
      const dist = distance(ghost.position, pacmanPos)
      if (dist > 8) return pacmanPos
      return ghost.scatterTarget
    }
    default:
      return pacmanPos
  }
}

function chooseDirection(
  ghost: Ghost,
  map: CellType[][],
  target: Position,
  canEnterHouse: boolean
): Direction {
  const available = getAvailableDirections(map, ghost.position, canEnterHouse)

  if (available.length === 0) return getOppositeDirection(ghost.direction)
  if (available.length === 1) return available[0]

  const filtered = ghost.mode === 'EATEN'
    ? available
    : available.filter(d => d !== getOppositeDirection(ghost.direction))

  if (filtered.length === 0) return getOppositeDirection(ghost.direction)
  if (filtered.length === 1) return filtered[0]

  let bestDir = filtered[0]
  let bestDist = Infinity

  for (const dir of filtered) {
    const nextPos = {
      x: ghost.position.x + GAME_CONFIG.DIRECTIONS[dir].x,
      y: ghost.position.y + GAME_CONFIG.DIRECTIONS[dir].y,
    }
    const dist = distance(nextPos, target)
    if (dist < bestDist) {
      bestDist = dist
      bestDir = dir
    }
  }

  return bestDir
}

export function updateGhost(
  ghost: Ghost,
  map: CellType[][],
  pacmanPos: Position,
  pacmanDir: Direction,
  blinkyPos: Position,
  deltaTime: number,
  ghostSpeed: number,
  frightenedSpeed: number
): Ghost {
  const newGhost = { ...ghost }

  // Handle home state
  if (newGhost.isHome) {
    newGhost.homeTimer -= deltaTime
    if (newGhost.homeTimer <= 0) {
      newGhost.isHome = false
      newGhost.position = { ...GHOST_SPAWNS[newGhost.name] }
      newGhost.direction = 'LEFT'
    }
    return newGhost
  }

  // Handle frightened timer
  if (newGhost.mode === 'FRIGHTENED') {
    newGhost.frightenedTimer -= deltaTime
    if (newGhost.frightenedTimer <= 0) {
      newGhost.mode = newGhost.previousMode
      newGhost.frightenedTimer = 0
    }
  }

  // Speed: cells per second
  let speed = ghostSpeed
  if (newGhost.mode === 'FRIGHTENED') speed = frightenedSpeed
  if (newGhost.mode === 'EATEN') speed = ghostSpeed * 2.5
  const cellTime = 125 / speed
  const moveAmount = deltaTime / cellTime

  const atCenter = isAtCellCenter(newGhost.position)

  if (atCenter) {
    newGhost.position = snapToCell(newGhost.position)

    // Get target based on mode
    let target: Position
    switch (newGhost.mode) {
      case 'SCATTER':
        target = newGhost.scatterTarget
        break
      case 'CHASE':
        target = getChaseTarget(newGhost, pacmanPos, pacmanDir, blinkyPos)
        break
      case 'FRIGHTENED': {
        const available = getAvailableDirections(map, newGhost.position, false)
        const reverse = getOppositeDirection(newGhost.direction)
        const filtered = available.filter(d => d !== reverse)
        const choices = filtered.length > 0 ? filtered : available
        if (choices.length > 0) {
          newGhost.direction = choices[Math.floor(Math.random() * choices.length)]
        }
        target = newGhost.position
        break
      }
      case 'EATEN':
        target = GHOST_SPAWNS[newGhost.name]
        if (distance(newGhost.position, target) < 1.5) {
          newGhost.isHome = true
          newGhost.homeTimer = 0
          newGhost.mode = 'SCATTER'
          return newGhost
        }
        break
    }

    // Choose direction at intersections
    if (newGhost.mode !== 'FRIGHTENED') {
      newGhost.direction = chooseDirection(newGhost, map, target, newGhost.mode === 'EATEN')
    }

    // Check if we can move
    if (!isGhostWalkable(map,
      newGhost.position.x + GAME_CONFIG.DIRECTIONS[newGhost.direction].x,
      newGhost.position.y + GAME_CONFIG.DIRECTIONS[newGhost.direction].y,
      false
    )) {
      return newGhost
    }
  }

  // Move
  const offset = GAME_CONFIG.DIRECTIONS[newGhost.direction]
  let newX = newGhost.position.x + offset.x * moveAmount
  let newY = newGhost.position.y + offset.y * moveAmount

  // Check wall ahead
  const checkX = Math.round(newX + offset.x * 0.1)
  const checkY = Math.round(newY + offset.y * 0.1)

  if (!isGhostWalkable(map, checkX, checkY, false)) {
    newGhost.position = snapToCell(newGhost.position)
  } else {
    newGhost.position = { x: newX, y: newY }
  }

  return newGhost
}

export function setGhostMode(ghost: Ghost, mode: GhostMode, duration?: number): Ghost {
  const newGhost = { ...ghost }
  newGhost.previousMode = newGhost.mode
  newGhost.mode = mode
  if (mode === 'FRIGHTENED' && duration) {
    newGhost.frightenedTimer = duration
  }
  if (mode !== 'FRIGHTENED') {
    newGhost.frightenedTimer = 0
  }
  if (mode !== 'FRIGHTENED' && mode !== 'EATEN') {
    newGhost.direction = getOppositeDirection(newGhost.direction)
  }
  return newGhost
}
