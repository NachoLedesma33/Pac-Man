import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-brutal-black/80" />

      {/* Modal Content */}
      <div
        className="
          relative
          w-full max-w-md
          bg-brutal-gray
          border-4 border-brutal-black
          shadow-[8px_8px_0px_0px_#FFE600]
          animate-in
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b-4 border-brutal-black bg-arcade-yellow">
            <h2 className="text-brutal-black font-black text-lg">{title}</h2>
            <button
              onClick={onClose}
              className="
                w-8 h-8
                bg-brutal-black text-brutal-white
                border-2 border-brutal-black
                flex items-center justify-center
                hover:bg-ghost-red
                active:translate-x-[1px] active:translate-y-[1px]
                transition-colors
                cursor-pointer
              "
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
