import { useState, useEffect, useCallback } from 'react'
import { Trophy, X } from 'lucide-react'

export interface ToastData {
  id: string
  title: string
  message: string
  type: 'achievement' | 'score' | 'info'
}

interface ToastItemProps {
  toast: ToastData
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const typeStyles = {
    achievement: 'bg-arcade-yellow text-brutal-black border-brutal-black',
    score: 'bg-ghost-cyan text-brutal-black border-brutal-black',
    info: 'bg-brutal-gray text-brutal-white border-brutal-black',
  }

  return (
    <div
      className={`
        flex items-center gap-3 p-3
        border-4 border-brutal-black
        shadow-[4px_4px_0px_0px_#000]
        transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${typeStyles[toast.type]}
      `}
    >
      {toast.type === 'achievement' && (
        <Trophy size={20} className="text-brutal-black flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{toast.title}</p>
        <p className="text-xs opacity-80 truncate">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  )
}

let toastCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((title: string, message: string, type: ToastData['type'] = 'info') => {
    const id = `toast-${++toastCounter}`
    setToasts(prev => [...prev, { id, title, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastData[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-xs">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
