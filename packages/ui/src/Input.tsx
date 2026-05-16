import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from './utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  icon?: ReactNode
}

export function Input({ label, hint, error, icon, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</span>}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
            icon && 'pl-10',
            className,
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  maxLength?: number
}

export function Textarea({ label, error, maxLength, className, id, value, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const currentLength = typeof value === 'string' ? value.length : 0
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex justify-between">
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">{label}</label>
          {maxLength && <span className="text-xs text-neutral-400">{currentLength}/{maxLength}</span>}
        </div>
      )}
      <textarea
        id={inputId}
        value={value}
        maxLength={maxLength}
        className={cn(
          'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors resize-none',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          error && 'border-danger-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
}
