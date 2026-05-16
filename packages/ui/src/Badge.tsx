import { cn } from './utils'

type BadgeVariant = 'oportunidade' | 'destaque' | 'novo' | 'financiamento' | 'alto-padrao' | 'mcmv' | 'fgts' | 'lancamento'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  oportunidade: 'bg-accent-500 text-white',
  destaque: 'bg-brand-500 text-white',
  novo: 'bg-success text-white',
  financiamento: 'bg-info-500 text-white',
  'alto-padrao': 'bg-purple-600 text-white',
  mcmv: 'bg-green-600 text-white',
  fgts: 'bg-teal-600 text-white',
  lancamento: 'bg-orange-500 text-white',
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide', variantStyles[variant], className)}>
      {children}
    </span>
  )
}
