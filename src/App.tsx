import { ThemeProvider } from './context/ThemeContext'
import { Layout } from './components/layout/Layout'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { Button } from './components/ui/Button'
import { Gamepad2, Zap } from 'lucide-react'

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          {/* Header */}
          <header className="flex items-center justify-between w-full max-w-2xl mb-8">
            <h1
              className="text-4xl md:text-6xl font-black text-arcade-yellow tracking-tighter"
              style={{
                fontFamily: 'var(--font-display)',
                textShadow: '4px 4px 0px #000, 6px 6px 0px #FFE600',
              }}
            >
              PAC-MAN
            </h1>
            <ThemeToggle />
          </header>

          {/* Arcade Cabinet */}
          <div
            className="
              w-full max-w-2xl
              bg-brutal-gray
              border-4 border-brutal-black
              shadow-[8px_8px_0px_0px_#FFE600]
              p-6
            "
          >
            {/* Screen */}
            <div
              className="
                w-full aspect-video
                bg-brutal-black
                border-4 border-brutal-black
                flex items-center justify-center
                relative
                overflow-hidden
              "
            >
              {/* Pac-Man ASCII Art */}
              <pre
                className="text-arcade-yellow text-xs md:text-sm leading-tight"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
{`
     ████████████████
   ██░░░░░░░░░░░░░░██
  █░░░░░░░░░░░░░░░░░░█
 █░░░░░░░░░░░░░░░░░░░░█
 █░░░░░██░░░░░░██░░░░░█
 █░░░░░██░░░░░░██░░░░░█
 █░░░░░░░░░░░░░░░░░░░░█
 █░░░░░░░░░░░░░░░░░░░░█
 █░░░░░████████░░░░░░░█
  █░░░░░░░░░░░░░░░░░░█
   ██░░░░░░░░░░░░░░██
     ████████████████
`}
              </pre>
            </div>

            {/* Controls Info */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="border-2 border-brutal-black bg-brutal-black p-3">
                <h3 className="text-arcade-yellow font-bold text-sm mb-2">CONTROLES</h3>
                <div className="text-brutal-white text-xs space-y-1">
                  <p>← → ↑ ↓  /  W A S D</p>
                  <p>ESPACIO  =  PAUSA</p>
                </div>
              </div>
              <div className="border-2 border-brutal-black bg-brutal-black p-3">
                <h3 className="text-ghost-cyan font-bold text-sm mb-2">TIPS</h3>
                <div className="text-brutal-white text-xs space-y-1">
                  <p>Las píldoras azules te dan poder</p>
                  <p>Los fantasmas huyen de ti</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button size="lg">
              <Gamepad2 className="inline mr-2" size={20} />
              INSERT COIN
            </Button>
            <Button variant="secondary" size="lg">
              <Zap className="inline mr-2" size={20} />
              MODO TURBO
            </Button>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-xs opacity-60">
            <p>NEO-BRUTAL ARCADE EDITION</p>
          </footer>
        </div>
      </Layout>
    </ThemeProvider>
  )
}

export default App
