import { ACHIEVEMENTS } from '../../types/achievements'
import type { AchievementState } from '../../types/achievements'
import { Trophy, Lock } from 'lucide-react'

interface AchievementPanelProps {
  achievementState: AchievementState
}

export function AchievementPanel({ achievementState }: AchievementPanelProps) {
  const unlockedCount = achievementState.unlocked.length
  const totalCount = ACHIEVEMENTS.length

  return (
    <div className="border-4 border-brutal-black bg-brutal-gray shadow-[6px_6px_0px_0px_#FFE600] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-arcade-yellow font-black text-lg flex items-center gap-2">
          <Trophy size={20} />
          LOGROS
        </h3>
        <span className="text-brutal-white text-sm font-bold">
          {unlockedCount}/{totalCount}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-brutal-black border-2 border-brutal-black mb-4">
        <div
          className="h-full bg-arcade-yellow transition-all duration-500"
          style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Achievement List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = achievementState.unlocked.includes(achievement.id)

          return (
            <div
              key={achievement.id}
              className={`
                flex items-center gap-3 p-2
                border-2 border-brutal-black
                transition-all duration-200
                ${isUnlocked
                  ? 'bg-arcade-yellow text-brutal-black'
                  : 'bg-brutal-black text-brutal-white opacity-60'
                }
              `}
            >
              <div className="text-xl flex-shrink-0">
                {isUnlocked ? achievement.icon : <Lock size={18} />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs truncate">{achievement.name}</p>
                <p className="text-[10px] opacity-70 truncate">{achievement.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
