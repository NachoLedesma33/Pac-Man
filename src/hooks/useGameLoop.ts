import { useRef, useEffect, useCallback } from 'react'

interface UseGameLoopProps {
  callback: (deltaTime: number) => void
  isRunning: boolean
}

export function useGameLoop({ callback, isRunning }: UseGameLoopProps) {
  const callbackRef = useRef(callback)
  const previousTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number>(0)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const loop = useCallback((timestamp: number) => {
    if (previousTimeRef.current === 0) {
      previousTimeRef.current = timestamp
    }

    const deltaTime = timestamp - previousTimeRef.current
    previousTimeRef.current = timestamp

    // Cap delta time to prevent huge jumps
    const cappedDelta = Math.min(deltaTime, 100)
    callbackRef.current(cappedDelta)

    animationFrameRef.current = requestAnimationFrame(loop)
  }, [])

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = 0
      animationFrameRef.current = requestAnimationFrame(loop)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRunning, loop])
}
