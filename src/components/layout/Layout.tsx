import type { ReactNode } from 'react'
import { usePWA } from '../../hooks/usePWA'
import { Download } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isInstallable, install } = usePWA()

  return (
    <div className="min-h-screen flex flex-col">
      {/* PWA Install Banner */}
      {isInstallable && (
        <div
          className="
            bg-arcade-yellow border-b-4 border-brutal-black
            px-4 py-3 flex items-center justify-between
          "
        >
          <span className="text-brutal-black font-bold text-sm">
            Instala Pac-Man en tu dispositivo
          </span>
          <button
            onClick={install}
            className="
              flex items-center gap-2
              bg-brutal-black text-arcade-yellow
              border-2 border-brutal-black
              px-4 py-2 font-bold text-sm
              shadow-[3px_3px_0px_0px_#FFE600]
              active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
              transition-all duration-100
              cursor-pointer
            "
          >
            <Download size={16} />
            Instalar
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
