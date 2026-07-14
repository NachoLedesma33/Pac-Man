import type { GameState } from '../../types/game'
import { GAME_CONFIG } from '../../constants/game'
import { MAP_WIDTH, MAP_HEIGHT } from '../../constants/map'

interface GameBoardProps {
  gameState: GameState
}

export function GameBoard({ gameState }: GameBoardProps) {
  const { map, pacman, ghosts, frightenedTimeRemaining } = gameState

  const cellSize = GAME_CONFIG.CELL_SIZE
  const mapW = MAP_WIDTH * cellSize
  const mapH = MAP_HEIGHT * cellSize

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden p-2"
      style={{ imageRendering: 'pixelated' }}
    >
      <div
        className="relative"
        style={{
          width: mapW,
          height: mapH,
          transformOrigin: 'center center',
          transform: `scale(${Math.min(1, 700 / mapW)})`,
        }}
      >
        {/* Map Layer */}
        <svg width={mapW} height={mapH} className="absolute inset-0">
          {map.map((row, y) =>
            row.map((cell, x) => {
              const cx = x * cellSize
              const cy = y * cellSize
              const inset = 0.5

              if (cell === 'WALL') {
                return (
                  <rect
                    key={`${x}-${y}`}
                    x={cx + inset}
                    y={cy + inset}
                    width={cellSize - inset * 2}
                    height={cellSize - inset * 2}
                    fill="#2121DE"
                    stroke="#000080"
                    strokeWidth={1}
                    rx={2}
                  />
                )
              }

              if (cell === 'DOT') {
                return (
                  <circle
                    key={`${x}-${y}`}
                    cx={cx + cellSize / 2}
                    cy={cy + cellSize / 2}
                    r={3}
                    fill="#FFB8AE"
                  />
                )
              }

              if (cell === 'POWER_PILL') {
                return (
                  <circle
                    key={`${x}-${y}`}
                    cx={cx + cellSize / 2}
                    cy={cy + cellSize / 2}
                    r={7}
                    fill="#FFB8AE"
                    className="animate-pulse"
                  />
                )
              }

              if (cell === 'GHOST_DOOR') {
                return (
                  <rect
                    key={`${x}-${y}`}
                    x={cx}
                    y={cy + cellSize / 2 - 2}
                    width={cellSize}
                    height={4}
                    fill="#FFB8FF"
                  />
                )
              }

              return null
            })
          )}
        </svg>

        {/* Pac-Man */}
        <div
          className="absolute"
          style={{
            left: pacman.position.x * cellSize + cellSize / 2,
            top: pacman.position.y * cellSize + cellSize / 2,
            width: cellSize * 0.9,
            height: cellSize * 0.9,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%">
            <path
              d={getPacmanPath(pacman.direction, pacman.mouthAngle)}
              fill="#FFE600"
              stroke="#000"
              strokeWidth={1}
            />
            <circle cx={12} cy={7} r={2.5} fill="#000" />
          </svg>
        </div>

        {/* Ghosts */}
        {ghosts.map((ghost) => {
          if (ghost.isHome) return null

          const isFrightened = ghost.mode === 'FRIGHTENED'
          const isEaten = ghost.mode === 'EATEN'
          const flashWarning = isFrightened && frightenedTimeRemaining < 2000 &&
            Math.floor(frightenedTimeRemaining / 200) % 2 === 0

          return (
            <div
              key={ghost.name}
              className="absolute"
              style={{
                left: ghost.position.x * cellSize + cellSize / 2,
                top: ghost.position.y * cellSize + cellSize / 2,
                width: cellSize * 0.85,
                height: cellSize * 0.85,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg viewBox="0 0 24 24" width="100%" height="100%">
                {isEaten ? (
                  <>
                    <circle cx={8} cy={10} r={3} fill="#FFF" stroke="#000" strokeWidth={0.5} />
                    <circle cx={16} cy={10} r={3} fill="#FFF" stroke="#000" strokeWidth={0.5} />
                    <circle cx={8} cy={10} r={1.5} fill="#00F" />
                    <circle cx={16} cy={10} r={1.5} fill="#00F" />
                  </>
                ) : (
                  <>
                    <path
                      d="M2 22 L2 12 Q2 2 12 2 Q22 2 22 12 L22 22 L18 18 L14 22 L10 22 L6 18 Z"
                      fill={flashWarning ? '#FFF' : isFrightened ? GAME_CONFIG.COLORS.FRIGHTENED : ghost.color}
                      stroke="#000"
                      strokeWidth={0.5}
                    />
                    <circle cx={8} cy={10} r={3} fill="#FFF" />
                    <circle cx={16} cy={10} r={3} fill="#FFF" />
                    <circle cx={8} cy={10} r={1.5} fill={isFrightened ? '#FFF' : '#00F'} />
                    <circle cx={16} cy={10} r={1.5} fill={isFrightened ? '#FFF' : '#00F'} />
                  </>
                )}
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getPacmanPath(direction: string, mouthAngle: number): string {
  const mouth = Math.abs(Math.sin(mouthAngle)) * 0.3
  const cx = 12
  const cy = 12
  const r = 11

  let startAngle: number
  let endAngle: number

  switch (direction) {
    case 'RIGHT':
      startAngle = mouth
      endAngle = Math.PI * 2 - mouth
      break
    case 'LEFT':
      startAngle = Math.PI + mouth
      endAngle = Math.PI - mouth
      break
    case 'DOWN':
      startAngle = Math.PI / 2 + mouth
      endAngle = Math.PI * 2 + Math.PI / 2 - mouth
      break
    case 'UP':
      startAngle = -Math.PI / 2 + mouth
      endAngle = Math.PI / 2 - mouth
      break
    default:
      startAngle = mouth
      endAngle = Math.PI * 2 - mouth
  }

  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`
}
