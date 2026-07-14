import { useState, useCallback } from 'react'
import { Trophy, X, Plus } from 'lucide-react'

export interface LeaderboardEntry {
  initials: string
  score: number
  level: number
  date: string
}

const STORAGE_KEY = 'pacman-leaderboard'
const MAX_ENTRIES = 5

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return []
  })

  const save = useCallback((newEntries: LeaderboardEntry[]) => {
    setEntries(newEntries)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries))
  }, [])

  const addEntry = useCallback((score: number, level: number, initials: string) => {
    const newEntry: LeaderboardEntry = {
      initials: initials.toUpperCase().slice(0, 3),
      score,
      level,
      date: new Date().toLocaleDateString(),
    }

    const newEntries = [...entries, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES)

    save(newEntries)
    return newEntries
  }, [entries, save])

  const isHighScore = useCallback((score: number) => {
    if (entries.length < MAX_ENTRIES) return score > 0
    return score > entries[entries.length - 1].score
  }, [entries])

  const getRank = useCallback((score: number) => {
    const rank = entries.findIndex(e => score >= e.score)
    return rank === -1 ? entries.length + 1 : rank + 1
  }, [entries])

  return { entries, addEntry, isHighScore, getRank }
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  onClose: () => void
}

export function Leaderboard({ entries, onClose }: LeaderboardProps) {
  return (
    <div className="border-4 border-brutal-black bg-brutal-gray shadow-[6px_6px_0px_0px_#FFE600] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-arcade-yellow font-black text-lg flex items-center gap-2">
          <Trophy size={20} />
          TOP SCORES
        </h3>
        <button
          onClick={onClose}
          className="w-6 h-6 bg-brutal-black text-brutal-white border-2 border-brutal-black flex items-center justify-center hover:bg-ghost-red cursor-pointer"
        >
          <X size={12} />
        </button>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <p className="text-brutal-white text-sm text-center py-4 opacity-60">
          Sin puntuaciones aún
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-3 p-2
                border-2 border-brutal-black
                ${index === 0 ? 'bg-arcade-yellow text-brutal-black' : 'bg-brutal-black text-brutal-white'}
              `}
            >
              <span className="font-black text-lg w-8 text-center">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
              </span>
              <div className="flex-1">
                <p className="font-black text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  {entry.initials}
                </p>
                <p className="text-[10px] opacity-70">Nivel {entry.level}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  {entry.score.toLocaleString()}
                </p>
                <p className="text-[10px] opacity-70">{entry.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface NameInputProps {
  isOpen: boolean
  onSubmit: (initials: string) => void
  onCancel: () => void
}

export function NameInput({ isOpen, onSubmit, onCancel }: NameInputProps) {
  const [initials, setInitials] = useState('')

  const handleSubmit = () => {
    if (initials.length >= 1) {
      onSubmit(initials)
      setInitials('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brutal-black/80" onClick={onCancel} />
      <div className="relative bg-brutal-gray border-4 border-brutal-black shadow-[8px_8px_0px_0px_#FFE600] p-6 w-full max-w-sm">
        <h3 className="text-arcade-yellow font-black text-xl mb-4 text-center">
          NUEVA PUNTUACIÓN ALTA
        </h3>
        <p className="text-brutal-white text-sm text-center mb-4">
          Ingresa tus iniciales (máx. 3 letras)
        </p>
        <input
          type="text"
          maxLength={3}
          value={initials}
          onChange={(e) => setInitials(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="
            w-full text-center text-3xl font-black
            bg-brutal-black text-arcade-yellow
            border-4 border-brutal-black
            p-3 mb-4
            focus:outline-none focus:border-arcade-yellow
          "
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.5em' }}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={initials.length === 0}
            className="
              flex-1 py-2 bg-arcade-yellow text-brutal-black
              border-4 border-brutal-black font-bold
              shadow-[3px_3px_0px_0px_#000]
              active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-100 cursor-pointer
              flex items-center justify-center gap-2
            "
          >
            <Plus size={16} />
            GUARDAR
          </button>
          <button
            onClick={onCancel}
            className="
              px-4 py-2 bg-brutal-black text-brutal-white
              border-4 border-brutal-black font-bold
              shadow-[3px_3px_0px_0px_#FFE600]
              active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
              transition-all duration-100 cursor-pointer
            "
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  )
}
