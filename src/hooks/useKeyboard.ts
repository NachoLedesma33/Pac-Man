import { useEffect, useCallback } from 'react'
import type { Direction } from '../types/game'

interface UseKeyboardProps {
  onDirection: (direction: Direction) => void
  onAction: (action: 'PAUSE' | 'START') => void
  enabled: boolean
}

export function useKeyboard({ onDirection, onAction, enabled }: UseKeyboardProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          onDirection('UP')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          onDirection('DOWN')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          onDirection('LEFT')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          onDirection('RIGHT')
          break
        case ' ':
          e.preventDefault()
          onAction('PAUSE')
          break
        case 'Enter':
          e.preventDefault()
          onAction('START')
          break
      }
    },
    [onDirection, onAction, enabled]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
