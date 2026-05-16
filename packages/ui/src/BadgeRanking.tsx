import { cn } from './utils'

type Classificacao = 'Excelente Oportunidade' | 'Boa Oportunidade' | 'Preço Justo' | 'Acima da Média' | 'Alto Padrão'

interface BadgeRankingProps {
  classificacao: Classificacao
  score?: number
  className?: string
}

const styles: Record<Classificacao, { bg: string; text: string; icon: string }> = {
  'Excelente Oportunidade': { bg: 'bg-accent-500', text: 'text-white', icon: '🏆' },
  'Boa Oportunidade': { bg: 'bg-success', text: 'text-white', icon: '✅' },
  'Preço Justo': { bg: 'bg-info-500', text: 'text-white', icon: '📊' },
  'Acima da Média': { bg: 'bg-neutral-400', text: 'text-white', icon: '📈' },
  'Alto Padrão': { bg: 'bg-purple-600', text: 'text-white', icon: '💎' },
}

export function BadgeRanking({ classificacao, score, className }: BadgeRankingProps) {
  const style = styles[classificacao]
  return (
    <div className={cn('inline-flex flex-col', className)}>
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold', style.bg, style.text)}>
        <span>{style.icon}</span>
        {classificacao}
        {score != null && <span className="opacity-80 ml-1">({score})</span>}
      </span>
      <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">
        Estimativa automatizada. Não é avaliação oficial.
      </span>
    </div>
  )
}
