import type { GameState } from '../../types/game'
import { GAME_CONFIG } from '../../constants/game'
import { MAP_WIDTH, MAP_HEIGHT } from '../../constants/map'

interface GameBoardProps {
  gameState: GameState
}

export function GameBoard({ gameState }: GameBoardProps) {
  const { map, pacman, ghosts, frightenedTimeRemaining } = gameState

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        imageRendering: 'pixelated',
      }}
    >
      <div
        className="relative"
        style={{
          width: MAP_WIDTH * GAME_CONFIG.CELL_SIZE,
          height: MAP_HEIGHT * GAME_CONFIG.CELL_SIZE,
          transform: `scale(${Math.min(1, 600 / (MAP_WIDTH * GAME_CONFIG.CELL_SIZE))})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Map Layer */}
        <svg
          width={MAP_WIDTH * GAME_CONFIG.CELL_SIZE}
          height={MAP_HEIGHT * GAME_CONFIG.CELL_SIZE}
          className="absolute inset-0"
        >
          {map.map((row, y) =>
            row.map((cell, x) => {
              const cellSize = GAME_CONFIG.CELL_SIZE
              const cx = x * cellSize
              const cy = y * cellSize

              if (cell === 'WALL') {
                return (
                  <rect
                    key={`${x}-${y}`}
                    x={cx}
                    y={cy}
                    width={cellSize}
                    height={cellSize}
                    fill="#2121DE"
                    stroke="#000080"
                    strokeWidth={0.5}
                  />
                )
              }

              if (cell === 'DOT') {
                return (
                  <circle
                    key={`${x}-${y}`}
                    cx={cx + cellSize / 2}
                    cy={cy + cellSize / 2}
                    r={2}
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
                    r={5}
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
          className="absolute transition-none"
          style={{
            left: pacman.position.x * GAME_CONFIG.CELL_SIZE,
            top: pacman.position.y * GAME_CONFIG.CELL_SIZE,
            width: GAME_CONFIG.CELL_SIZE,
            height: GAME_CONFIG.CELL_SIZE,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg viewBox="0 0 16 16" width={GAME_CONFIG.CELL_SIZE} height={GAME_CONFIG.CELL_SIZE}>
            <path
              d={getPacmanPath(pacman.direction, pacman.mouthAngle)}
              fill="#FFE600"
              stroke="#000"
              strokeWidth={0.5}
            />
            <circle
              cx={8}
              cy={5}
              r={1.5}
              fill="#000"
            />
          </svg>
        </div>

        {/* Ghosts */}
        {ghosts.map((ghost) => {
          if (ghost.isHome) return null

          const isFrightened = ghost.mode === 'FRIGHTENED'
          const isEaten = ghost.mode === 'EATEN'
          const flashWarning = isFrightened && frightenedTimeRemaining < 2000 && Math.floor(frightenedTimeRemaining / 200) % 2 === 0

          return (
            <div
              key={ghost.name}
              className="absolute transition-none"
              style={{
                left: ghost.position.x * GAME_CONFIG.CELL_SIZE,
                top: ghost.position.y * GAME_CONFIG.CELL_SIZE,
                width: GAME_CONFIG.CELL_SIZE,
                height: GAME_CONFIG.CELL_SIZE,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg viewBox="0 0 16 16" width={GAME_CONFIG.CELL_SIZE} height={GAME_CONFIG.CELL_SIZE}>
                {isEaten ? (
                  // Just eyes for eaten ghost
                  <>
                    <circle cx={5} cy={7} r={2} fill="#FFF" stroke="#000" strokeWidth={0.5} />
                    <circle cx={11} cy={7} r={2} fill="#FFF" stroke="#000" strokeWidth={0.5} />
                    <circle cx={5} cy={7} r={1} fill="#00F" />
                    <circle cx={11} cy={7} r={1} fill="#00F" />
                  </>
                ) : (
                  <>
                    {/* Ghost body */}
                    <path
                      d="M1 15 L1 8 Q1 1 8 1 Q15 1 15 8 L15 15 L12 12 L9 15 L7 15 L4 12 Z"
                      fill={flashWarning ? '#FFF' : isFrightened ? GAME_CONFIG.COLORS.FRIGHTENED : ghost.color}
                      stroke="#000"
                      strokeWidth={0.5}
                    />
                    {/* Eyes */}
                    <circle cx={5} cy={7} r={2} fill="#FFF" />
                    <circle cx={11} cy={7} r={2} fill="#FFF" />
                    <circle cx={5} cy={7} r={1} fill={isFrightened ? '#FFF' : '#00F'} />
                    <circle cx={11} cy={7} r={1} fill={isFrightened ? '#FFF' : '#00F'} />
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
  const centerX = 8
  const centerY = 8
  const radius = 7

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

  const x1 = centerX + radius * Math.cos(startAngle)
  const y1 = centerY + radius * Math.sin(startAngle)
  const x2 = centerX + radius * Math.cos(endAngle)
  const y2 = centerY + radius * Math.sin(endAngle)

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

  return `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`
}
