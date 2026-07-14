import type { Ghost, GhostName, GhostMode, Direction, Position, CellType } from '../types/game'
import { GAME_CONFIG } from '../constants/game'
import { GHOST_SPAWNS, GHOST_SCATTER_TARGETS } from '../constants/map'
import { getAvailableDirections, distance, getOppositeDirection, isGhostWalkable } from './map'

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
      // Directly targets Pac-Man
      return pacmanPos

    case 'PINKY': {
      // Targets 4 tiles ahead of Pac-Man
      const offset = GAME_CONFIG.DIRECTIONS[pacmanDir]
      return {
        x: pacmanPos.x + offset.x * 4,
        y: pacmanPos.y + offset.y * 4,
      }
    }

    case 'INKY': {
      // Uses Blinky's position to calculate target
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
      // Targets Pac-Man when far, scatter corner when close
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

  if (available.length === 0) {
    return getOppositeDirection(ghost.direction)
  }

  if (available.length === 1) {
    return available[0]
  }

  // Filter out reverse direction (ghosts can't reverse unless eaten)
  const filtered = ghost.mode === 'EATEN'
    ? available
    : available.filter(d => d !== getOppositeDirection(ghost.direction))

  if (filtered.length === 0) return getOppositeDirection(ghost.direction)
  if (filtered.length === 1) return filtered[0]

  // Choose direction closest to target
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

  // Handle home state (waiting to leave)
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

  // Calculate speed based on mode
  let speed = ghostSpeed
  if (newGhost.mode === 'FRIGHTENED') speed = frightenedSpeed
  if (newGhost.mode === 'EATEN') speed = ghostSpeed * 2

  // Calculate movement
  const moveAmount = speed * (deltaTime / 1000) * 8

  // Get target based on mode
  let target: Position
  switch (newGhost.mode) {
    case 'SCATTER':
      target = newGhost.scatterTarget
      break
    case 'CHASE':
      target = getChaseTarget(newGhost, pacmanPos, pacmanDir, blinkyPos)
      break
    case 'FRIGHTENED':
      // Random movement - pick random available direction
      {
        const available = getAvailableDirections(map, newGhost.position, false)
        const reverse = getOppositeDirection(newGhost.direction)
        const filtered = available.filter(d => d !== reverse)
        const choices = filtered.length > 0 ? filtered : available
        if (choices.length > 0) {
          newGhost.direction = choices[Math.floor(Math.random() * choices.length)]
        }
      }
      target = newGhost.position
      break
    case 'EATEN':
      target = GHOST_SPAWNS[newGhost.name]
      // If close to home, re-enter
      if (distance(newGhost.position, target) < 2) {
        newGhost.isHome = true
        newGhost.homeTimer = 0
        newGhost.mode = 'SCATTER'
        return newGhost
      }
      break
  }

  // Choose direction (for CHASE, SCATTER, EATEN modes)
  if (newGhost.mode !== 'FRIGHTENED') {
    newGhost.direction = chooseDirection(newGhost, map, target, newGhost.mode === 'EATEN')
  }

  // Move ghost
  if (isGhostWalkable(map,
    newGhost.position.x + GAME_CONFIG.DIRECTIONS[newGhost.direction].x,
    newGhost.position.y + GAME_CONFIG.DIRECTIONS[newGhost.direction].y,
    false
  )) {
    const offset = GAME_CONFIG.DIRECTIONS[newGhost.direction]
    newGhost.position = {
      x: newGhost.position.x + offset.x * moveAmount,
      y: newGhost.position.y + offset.y * moveAmount,
    }
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
  // Reverse direction on mode change (except for frightened)
  if (mode !== 'FRIGHTENED' && mode !== 'EATEN') {
    newGhost.direction = getOppositeDirection(newGhost.direction)
  }
  return newGhost
}
