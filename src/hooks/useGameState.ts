import { useState, useCallback, useRef } from 'react'
import type { GameState, Direction, Difficulty } from '../types/game'
import { GAME_CONFIG } from '../constants/game'
import { createMap, countDots } from '../engine/map'
import { PACMAN_SPAWN } from '../constants/map'
import { createPacman, updatePacman } from '../engine/pacman'
import { createGhost, updateGhost, setGhostMode } from '../engine/ghost'
import { checkPacmanGhostCollision, calculateGhostScore } from '../engine/collision'

function createInitialState(difficulty: Difficulty): GameState {
  const settings = GAME_CONFIG.DIFFICULTY[difficulty]
  const map = createMap()

  return {
    pacman: createPacman(PACMAN_SPAWN, settings.pacmanSpeed * 5),
    ghosts: [
      createGhost('BLINKY', settings.ghostSpeed * 5, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[0]),
      createGhost('PINKY', settings.ghostSpeed * 5, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[1]),
      createGhost('INKY', settings.ghostSpeed * 5, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[2]),
      createGhost('CLYDE', settings.ghostSpeed * 5, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[3]),
    ],
    map,
    score: 0,
    highScore: parseInt(localStorage.getItem('pacman-highscore') || '0', 10),
    lives: settings.startingLives,
    level: 1,
    difficulty,
    isPlaying: true,
    isPaused: false,
    isGameOver: false,
    dotsRemaining: countDots(map),
    totalDots: countDots(map),
    comboCount: 0,
    frightenedTimeRemaining: 0,
    modeTimer: GAME_CONFIG.TIMING.SCATTER_DURATION,
    isChaseMode: false,
  }
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState('NORMAL')
  )
  const gameStateRef = useRef(gameState)
  gameStateRef.current = gameState

  const startGame = useCallback((difficulty: Difficulty = 'NORMAL') => {
    setGameState(createInitialState(difficulty))
  }, [])

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }))
  }, [])

  const setDirection = useCallback((direction: Direction) => {
    setGameState(prev => ({
      ...prev,
      pacman: {
        ...prev.pacman,
        nextDirection: direction,
      },
    }))
  }, [])

  const updateGame = useCallback((deltaTime: number) => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.isPaused || prev.isGameOver) return prev

      const settings = GAME_CONFIG.DIFFICULTY[prev.difficulty]
      let newState = { ...prev }

      // Update mode timer (scatter/chase cycle)
      newState.modeTimer -= deltaTime
      if (newState.modeTimer <= 0) {
        newState.isChaseMode = !newState.isChaseMode
        newState.modeTimer = newState.isChaseMode
          ? GAME_CONFIG.TIMING.CHASE_DURATION
          : GAME_CONFIG.TIMING.SCATTER_DURATION

        // Update ghost modes
        const newMode = newState.isChaseMode ? 'CHASE' as const : 'SCATTER' as const
        newState.ghosts = newState.ghosts.map(g => setGhostMode(g, newMode))
      }

      // Update frightened timer
      if (newState.frightenedTimeRemaining > 0) {
        newState.frightenedTimeRemaining -= deltaTime
        if (newState.frightenedTimeRemaining <= 0) {
          newState.frightenedTimeRemaining = 0
          newState.comboCount = 0
        }
      }

      // Update Pac-Man
      const pacmanResult = updatePacman(newState.pacman, newState.map, deltaTime)
      newState.pacman = pacmanResult.pacman

      // Handle dot consumption
      if (pacmanResult.cellConsumed) {
        const { x, y } = pacmanResult.cellConsumed
        const cellType = newState.map[y][x]

        if (cellType === 'DOT') {
          newState.score += GAME_CONFIG.POINTS.DOT
          newState.dotsRemaining--
          newState.map = newState.map.map((row, ri) =>
            ri === y ? row.map((cell, ci) => ci === x ? 'EMPTY' as const : cell) : row
          )
        } else if (cellType === 'POWER_PILL') {
          newState.score += GAME_CONFIG.POINTS.POWER_PILL
          newState.dotsRemaining--
          newState.frightenedTimeRemaining = settings.frightenedDuration
          newState.comboCount = 0
          newState.map = newState.map.map((row, ri) =>
            ri === y ? row.map((cell, ci) => ci === x ? 'EMPTY' as const : cell) : row
          )

          // Set all ghosts to frightened
          newState.ghosts = newState.ghosts.map(g =>
            setGhostMode(g, 'FRIGHTENED', settings.frightenedDuration)
          )
        }

        // Check level complete
        if (newState.dotsRemaining <= 0) {
          newState.score += GAME_CONFIG.POINTS.LEVEL_COMPLETE
          newState.level++
          const newMap = createMap()
          newState.map = newMap
          newState.dotsRemaining = countDots(newMap)
          newState.totalDots = countDots(newMap)
        }
      }

      // Update ghosts
      const blinkyPos = newState.ghosts[0].position
      newState.ghosts = newState.ghosts.map(ghost =>
        updateGhost(
          ghost,
          newState.map,
          newState.pacman.position,
          newState.pacman.direction,
          blinkyPos,
          deltaTime,
          settings.ghostSpeed * 5,
          settings.frightenedSpeed * 5
        )
      )

      // Check collisions
      const collision = checkPacmanGhostCollision(newState.pacman, newState.ghosts)
      if (collision.collided) {
        if (collision.wasFrightened) {
          // Eat the ghost
          const ghostScore = calculateGhostScore(newState.comboCount)
          newState.score += ghostScore
          newState.comboCount++
          newState.ghosts = newState.ghosts.map((g, i) =>
            i === collision.ghostIndex ? setGhostMode(g, 'EATEN') : g
          )
        } else {
          // Pac-Man dies
          newState.lives--
          if (newState.lives <= 0) {
            newState.isGameOver = true
            newState.isPlaying = false
            // Update high score
            if (newState.score > newState.highScore) {
              newState.highScore = newState.score
              localStorage.setItem('pacman-highscore', newState.highScore.toString())
            }
          } else {
            // Reset positions
            newState.pacman = createPacman(PACMAN_SPAWN, settings.pacmanSpeed * 5)
            newState.ghosts = [
              createGhost('BLINKY', settings.ghostSpeed * 5, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[0]),
              createGhost('PINKY', settings.ghostSpeed * 5, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[1]),
              createGhost('INKY', settings.ghostSpeed * 5, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[2]),
              createGhost('CLYDE', settings.ghostSpeed * 5, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[3]),
            ]
            newState.frightenedTimeRemaining = 0
            newState.comboCount = 0
          }
        }
      }

      return newState
    })
  }, [])

  return {
    gameState,
    startGame,
    togglePause,
    setDirection,
    updateGame,
  }
}
