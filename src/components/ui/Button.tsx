import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark border-transparent',
  outline: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
