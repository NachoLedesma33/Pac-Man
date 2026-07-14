import { Trophy, Heart, Zap } from 'lucide-react'

interface ScoreBoardProps {
  score: number
  highScore: number
  lives: number
  level: number
}

export function ScoreBoard({ score, highScore, lives, level }: ScoreBoardProps) {
  const formatScore = (value: number) => value.toString().padStart(7, '0')

  return (
    <div className="w-full border-4 border-brutal-black bg-brutal-black p-3 shadow-[4px_4px_0px_0px_#FFE600]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Score */}
        <div className="text-center">
          <p className="text-brutal-white text-xs font-bold mb-1 flex items-center justify-center gap-1">
            <Zap size={10} className="text-arcade-yellow" />
            SCORE
          </p>
          <p
            className="text-arcade-yellow text-xl md:text-2xl font-black"
            style={{ fontFamily: 'var(--font-mono)', textShadow: '2px 2px 0px #CCB800' }}
          >
            {formatScore(score)}
          </p>
        </div>

        {/* High Score */}
        <div className="text-center">
          <p className="text-brutal-white text-xs font-bold mb-1 flex items-center justify-center gap-1">
            <Trophy size={10} className="text-ghost-cyan" />
            HIGH SCORE
          </p>
          <p
            className="text-ghost-cyan text-xl md:text-2xl font-black"
            style={{ fontFamily: 'var(--font-mono)', textShadow: '2px 2px 0px #008B8B' }}
          >
            {formatScore(highScore)}
          </p>
        </div>

        {/* Lives */}
        <div className="text-center">
          <p className="text-brutal-white text-xs font-bold mb-1 flex items-center justify-center gap-1">
            <Heart size={10} className="text-ghost-red" />
            LIVES
          </p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: lives }).map((_, i) => (
              <span key={i} className="text-arcade-yellow text-lg">ᗧ</span>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="text-center">
          <p className="text-brutal-white text-xs font-bold mb-1">LEVEL</p>
          <p
            className="text-ghost-orange text-xl md:text-2xl font-black"
            style={{ fontFamily: 'var(--font-mono)', textShadow: '2px 2px 0px #CC8800' }}
          >
            {level.toString().padStart(2, '0')}
          </p>
        </div>
      </div>
    </div>
  )
}
