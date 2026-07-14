import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = `
    font-bold border-4 border-brutal-black
    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
    transition-all duration-100
    cursor-pointer
    font-[family-name:var(--font-mono)]
  `

  const variants = {
    primary: 'bg-arcade-yellow text-brutal-black shadow-[4px_4px_0px_0px_#000000]',
    secondary: 'bg-brutal-white text-brutal-black shadow-[4px_4px_0px_0px_#000000]',
    danger: 'bg-ghost-red text-brutal-white shadow-[4px_4px_0px_0px_#000000]',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-5 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
