import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-16 h-8
        border-4 border-brutal-black
        font-bold text-sm
        flex items-center
        transition-all duration-150
        active:translate-x-[2px] active:translate-y-[2px]
        cursor-pointer
        ${theme === 'dark'
          ? 'bg-brutal-gray shadow-[4px_4px_0px_0px_#FFE600]'
          : 'bg-arcade-yellow shadow-[4px_4px_0px_0px_#000000]'
        }
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <div
        className={`
          absolute top-0 w-8 h-full
          flex items-center justify-center
          border-r-4 border-brutal-black
          transition-all duration-150
          ${theme === 'dark'
            ? 'left-8 bg-arcade-yellow text-brutal-black'
            : 'left-0 bg-brutal-white text-brutal-black'
          }
        `}
      >
        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
      </div>
    </button>
  )
}
