import { useState, useCallback, useRef } from 'react'
import type { GameState, Direction, Difficulty } from '../types/game'
import { GAME_CONFIG } from '../constants/game'
import { createMap, countDots } from '../engine/map'
import { PACMAN_SPAWN } from '../constants/map'
import { createPacman, updatePacman } from '../engine/pacman'
import { createGhost, updateGhost, setGhostMode } from '../engine/ghost'
import { checkPacmanGhostCollision, calculateGhostScore } from '../engine/collision'

export interface GameStats {
  dotsEaten: number
  ghostsEaten: number
  powerPillsUsed: number
  maxCombo: number
  level: number
  lives: number
  score: number
}

function createInitialState(difficulty: Difficulty): GameState {
  const settings = GAME_CONFIG.DIFFICULTY[difficulty]
  const map = createMap()

  return {
    pacman: createPacman(PACMAN_SPAWN, settings.pacmanSpeed),
    ghosts: [
      createGhost('BLINKY', settings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[0]),
      createGhost('PINKY', settings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[1]),
      createGhost('INKY', settings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[2]),
      createGhost('CLYDE', settings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[3]),
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
  const [gameStats, setGameStats] = useState<GameStats>({
    dotsEaten: 0,
    ghostsEaten: 0,
    powerPillsUsed: 0,
    maxCombo: 0,
    level: 1,
    lives: 3,
    score: 0,
  })
  const gameStateRef = useRef(gameState)
  gameStateRef.current = gameState

  const startGame = useCallback((difficulty: Difficulty = 'NORMAL') => {
    const settings = GAME_CONFIG.DIFFICULTY[difficulty]
    setGameState(createInitialState(difficulty))
    setGameStats({
      dotsEaten: 0,
      ghostsEaten: 0,
      powerPillsUsed: 0,
      maxCombo: 0,
      level: 1,
      lives: settings.startingLives,
      score: 0,
    })
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

      const baseSettings = GAME_CONFIG.DIFFICULTY[prev.difficulty]
      const settings = GAME_CONFIG.getLevelSettings(baseSettings, prev.level)
      let newState = { ...prev }

      // Update mode timer (scatter/chase cycle)
      newState.modeTimer -= deltaTime
      if (newState.modeTimer <= 0) {
        newState.isChaseMode = !newState.isChaseMode
        newState.modeTimer = newState.isChaseMode
          ? GAME_CONFIG.getChaseDuration(prev.level)
          : GAME_CONFIG.getScatterDuration(prev.level)

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
          setGameStats(prev => ({ ...prev, dotsEaten: prev.dotsEaten + 1, score: newState.score }))
          newState.map = newState.map.map((row, ri) =>
            ri === y ? row.map((cell, ci) => ci === x ? 'EMPTY' as const : cell) : row
          )
        } else if (cellType === 'POWER_PILL') {
          newState.score += GAME_CONFIG.POINTS.POWER_PILL
          newState.dotsRemaining--
          newState.frightenedTimeRemaining = settings.frightenedDuration
          newState.comboCount = 0
          setGameStats(prev => ({
            ...prev,
            dotsEaten: prev.dotsEaten + 1,
            powerPillsUsed: prev.powerPillsUsed + 1,
            score: newState.score,
          }))
          newState.map = newState.map.map((row, ri) =>
            ri === y ? row.map((cell, ci) => ci === x ? 'EMPTY' as const : cell) : row
          )

          newState.ghosts = newState.ghosts.map(g =>
            setGhostMode(g, 'FRIGHTENED', settings.frightenedDuration)
          )
        }

        // Check level complete
        if (newState.dotsRemaining <= 0) {
          newState.score += GAME_CONFIG.POINTS.LEVEL_COMPLETE
          newState.level++
          setGameStats(prev => ({
            ...prev,
            level: newState.level,
            score: newState.score,
          }))
          const newMap = createMap()
          newState.map = newMap
          newState.dotsRemaining = countDots(newMap)
          newState.totalDots = countDots(newMap)

          // Recreate ghosts and pacman with new level's speed
          const newSettings = GAME_CONFIG.getLevelSettings(baseSettings, newState.level)
          newState.pacman = createPacman(PACMAN_SPAWN, newSettings.pacmanSpeed)
          newState.ghosts = [
            createGhost('BLINKY', newSettings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[0]),
            createGhost('PINKY', newSettings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[1]),
            createGhost('INKY', newSettings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[2]),
            createGhost('CLYDE', newSettings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[3]),
          ]
          newState.frightenedTimeRemaining = 0
          newState.comboCount = 0
          newState.modeTimer = GAME_CONFIG.getScatterDuration(newState.level)
          newState.isChaseMode = false
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
          settings.ghostSpeed,
          settings.frightenedSpeed
        )
      )

      // Check collisions
      const collision = checkPacmanGhostCollision(newState.pacman, newState.ghosts)
      if (collision.collided) {
        if (collision.wasFrightened) {
          const ghostScore = calculateGhostScore(newState.comboCount)
          newState.score += ghostScore
          newState.comboCount++
          setGameStats(prev => ({
            ...prev,
            ghostsEaten: prev.ghostsEaten + 1,
            maxCombo: Math.max(prev.maxCombo, newState.comboCount),
            score: newState.score,
          }))
          newState.ghosts = newState.ghosts.map((g, i) =>
            i === collision.ghostIndex ? setGhostMode(g, 'EATEN') : g
          )
        } else {
          newState.lives--
          setGameStats(prev => ({ ...prev, lives: newState.lives }))
          if (newState.lives <= 0) {
            newState.isGameOver = true
            newState.isPlaying = false
            if (newState.score > newState.highScore) {
              newState.highScore = newState.score
              localStorage.setItem('pacman-highscore', newState.highScore.toString())
            }
          } else {
            newState.pacman = createPacman(PACMAN_SPAWN, settings.pacmanSpeed)
            newState.ghosts = [
              createGhost('BLINKY', settings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[0]),
              createGhost('PINKY', settings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[1]),
              createGhost('INKY', settings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[2]),
              createGhost('CLYDE', settings.ghostSpeed, GAME_CONFIG.TIMING.GHOST_HOME_DELAY[3]),
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
    gameStats,
    startGame,
    togglePause,
    setDirection,
    updateGame,
  }
}
