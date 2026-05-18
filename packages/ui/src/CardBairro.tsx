import { cn, formatCurrency } from './utils'
import type { BairroListItem } from '@imov/types'

interface CardBairroProps {
  bairro: BairroListItem
  className?: string
}

const perfilLabel: Record<string, string> = {
  POPULAR: 'Popular',
  MEDIO: 'Médio',
  ALTO_PADRAO: 'Alto Padrão',
  LUXO: 'Luxo',
}

export function CardBairro({ bairro, className }: CardBairroProps) {
  const isPlaceholder = !bairro.imagemDestaqueUrl || bairro.imagemDestaqueUrl.startsWith('[')

  return (
    <div className={cn('group rounded-xl overflow-hidden border border-neutral-200 bg-white hover:shadow-card-hover transition-all duration-200', className)}>
      <div className="relative h-40 bg-neutral-100">
        {isPlaceholder ? (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
            <span className="text-brand-600 font-display font-bold text-2xl">{bairro.nome[0]}</span>
          </div>
        ) : (
          <img
            src={bairro.imagemDestaqueUrl!}
            alt={bairro.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
        <div className="absolute bottom-2 left-2">
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 rounded uppercase',
            bairro.perfil === 'LUXO' ? 'bg-purple-600 text-white' :
            bairro.perfil === 'ALTO_PADRAO' ? 'bg-brand-600 text-white' :
            bairro.perfil === 'MEDIO' ? 'bg-accent-500 text-white' :
            'bg-neutral-600 text-white'
          )}>
            {perfilLabel[bairro.perfil]}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-neutral-900 group-hover:text-brand-600 transition-colors">{bairro.nome}</h3>
        <p className="text-xs text-neutral-500">{bairro.cidade.nome}</p>
        {bairro.precoM2MedioVenda && (
          <p className="text-sm font-semibold text-neutral-700 mt-1">
            {formatCurrency(Number(bairro.precoM2MedioVenda))}/m²
          </p>
        )}
        {bairro.totalImoveis != null && (
          <p className="text-xs text-neutral-400 mt-0.5">{bairro.totalImoveis} imóveis</p>
        )}
      </div>
    </div>
  )
}
