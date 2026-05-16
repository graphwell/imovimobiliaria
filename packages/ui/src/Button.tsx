import { cn } from './utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500',
    secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-500',
    outline: 'border-2 border-brand-500 text-brand-500 hover:bg-brand-50 focus-visible:ring-brand-500',
    ghost: 'text-neutral-600 hover:bg-neutral-100 focus-visible:ring-neutral-400',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 focus-visible:ring-danger-500',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#20BD5C] focus-visible:ring-[#25D366]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
