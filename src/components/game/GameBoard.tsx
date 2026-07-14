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
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ imageRendering: 'pixelated' }}
    >
      <div
        className="relative"
        style={{
          width: mapW,
          height: mapH,
          transformOrigin: 'center center',
        }}
      >
        {/* Map Layer */}
        <svg width={mapW} height={mapH} className="absolute inset-0">
          {map.map((row, y) =>
            row.map((cell, x) => {
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
                    r={2.5}
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
                    r={6}
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
            left: pacman.position.x * cellSize,
            top: pacman.position.y * cellSize,
            width: cellSize,
            height: cellSize,
            transform: 'translate(-50%, -50%)',
            transition: 'none',
          }}
        >
          <svg viewBox="0 0 20 20" width={cellSize} height={cellSize}>
            <path
              d={getPacmanPath(pacman.direction, pacman.mouthAngle)}
              fill="#FFE600"
              stroke="#000"
              strokeWidth={0.5}
            />
            <circle cx={10} cy={6} r={2} fill="#000" />
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
                left: ghost.position.x * cellSize,
                top: ghost.position.y * cellSize,
                width: cellSize,
                height: cellSize,
                transform: 'translate(-50%, -50%)',
                transition: 'none',
              }}
            >
              <svg viewBox="0 0 20 20" width={cellSize} height={cellSize}>
                {isEaten ? (
                  <>
                    <circle cx={6} cy={9} r={2.5} fill="#FFF" stroke="#000" strokeWidth={0.5} />
                    <circle cx={14} cy={9} r={2.5} fill="#FFF" stroke="#000" strokeWidth={0.5} />
                    <circle cx={6} cy={9} r={1.2} fill="#00F" />
                    <circle cx={14} cy={9} r={1.2} fill="#00F" />
                  </>
                ) : (
                  <>
                    <path
                      d="M1 19 L1 10 Q1 1 10 1 Q19 1 19 10 L19 19 L15 15.5 L12 19 L8 19 L5 15.5 Z"
                      fill={flashWarning ? '#FFF' : isFrightened ? GAME_CONFIG.COLORS.FRIGHTENED : ghost.color}
                      stroke="#000"
                      strokeWidth={0.5}
                    />
                    <circle cx={7} cy={9} r={2.5} fill="#FFF" />
                    <circle cx={13} cy={9} r={2.5} fill="#FFF" />
                    <circle cx={7} cy={9} r={1.2} fill={isFrightened ? '#FFF' : '#00F'} />
                    <circle cx={13} cy={9} r={1.2} fill={isFrightened ? '#FFF' : '#00F'} />
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
  const cx = 10
  const cy = 10
  const r = 9

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
