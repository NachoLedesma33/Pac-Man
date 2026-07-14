import type { CellType, Direction, Position } from '../types/game'
import { CLASSIC_MAP, MAP_WIDTH, MAP_HEIGHT } from '../constants/map'
import { GAME_CONFIG } from '../constants/game'

export function createMap(): CellType[][] {
  return CLASSIC_MAP.map(row => [...row])
}

export function isWall(map: CellType[][], x: number, y: number): boolean {
  const ix = Math.round(x)
  const iy = Math.round(y)
  if (ix < 0 || ix >= MAP_WIDTH || iy < 0 || iy >= MAP_HEIGHT) return true
  return map[iy][ix] === 'WALL'
}

export function isWalkable(map: CellType[][], x: number, y: number): boolean {
  const ix = Math.round(x)
  const iy = Math.round(y)
  if (ix < 0 || ix >= MAP_WIDTH || iy < 0 || iy >= MAP_HEIGHT) return false
  const cell = map[iy][ix]
  return cell !== 'WALL' && cell !== 'GHOST_HOUSE' && cell !== 'GHOST_DOOR'
}

export function isGhostWalkable(map: CellType[][], x: number, y: number, canEnterHouse: boolean): boolean {
  const ix = Math.round(x)
  const iy = Math.round(y)
  if (ix < 0 || ix >= MAP_WIDTH || iy < 0 || iy >= MAP_HEIGHT) return false
  const cell = map[iy][ix]
  if (cell === 'WALL') return false
  if (cell === 'GHOST_HOUSE' || cell === 'GHOST_DOOR') return canEnterHouse
  return true
}

export function canMove(map: CellType[][], position: Position, direction: Direction): boolean {
  const offset = GAME_CONFIG.DIRECTIONS[direction]
  const newX = position.x + offset.x
  const newY = position.y + offset.y
  return isWalkable(map, newX, newY)
}

export function getNextPosition(position: Position, direction: Direction): Position {
  const offset = GAME_CONFIG.DIRECTIONS[direction]
  return {
    x: position.x + offset.x,
    y: position.y + offset.y,
  }
}

export function isAtIntersection(map: CellType[][], position: Position): boolean {
  let openPaths = 0
  for (const dir of Object.keys(GAME_CONFIG.DIRECTIONS) as Direction[]) {
    if (canMove(map, position, dir)) openPaths++
  }
  return openPaths >= 3
}

export function countDots(map: CellType[][]): number {
  let count = 0
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (map[y][x] === 'DOT' || map[y][x] === 'POWER_PILL') count++
    }
  }
  return count
}

export function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case 'UP': return 'DOWN'
    case 'DOWN': return 'UP'
    case 'LEFT': return 'RIGHT'
    case 'RIGHT': return 'LEFT'
  }
}

export function getAvailableDirections(
  map: CellType[][],
  position: Position,
  canEnterHouse: boolean = false
): Direction[] {
  const directions: Direction[] = []
  for (const dir of Object.keys(GAME_CONFIG.DIRECTIONS) as Direction[]) {
    const offset = GAME_CONFIG.DIRECTIONS[dir]
    const newX = position.x + offset.x
    const newY = position.y + offset.y
    if (isGhostWalkable(map, newX, newY, canEnterHouse)) {
      directions.push(dir)
    }
  }
  return directions
}

export function distance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

// Handle tunnel wrapping
export function wrapPosition(position: Position): Position {
  if (position.x < -1) return { x: MAP_WIDTH, y: position.y }
  if (position.x > MAP_WIDTH) return { x: -1, y: position.y }
  return position
}

export function isValidPosition(position: Position): boolean {
  return (
    position.x >= 0 &&
    position.x < MAP_WIDTH &&
    position.y >= 0 &&
    position.y < MAP_HEIGHT
  )
}
