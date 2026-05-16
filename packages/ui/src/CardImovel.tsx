import { cn, formatCurrency, formatArea } from './utils'
import { Badge } from './Badge'
import { BadgeRanking } from './BadgeRanking'
import type { ImovelListItem } from '@imov/types'

interface CardImovelProps {
  imovel: ImovelListItem
  variant?: 'vertical' | 'horizontal'
  className?: string
  href?: string
}

export function CardImovel({ imovel, variant = 'vertical', className }: CardImovelProps) {
  const fotoCapa = Array.isArray(imovel.fotos)
    ? (imovel.fotos as { url: string; tipo: string }[]).find(f => f.tipo === 'capa') ?? (imovel.fotos as { url: string }[])[0]
    : null
  const fotoUrl = fotoCapa?.url ?? '/placeholder-imovel.jpg'
  const isPlaceholder = fotoUrl.startsWith('[') || fotoUrl === '/placeholder-imovel.jpg'

  if (variant === 'horizontal') {
    return (
      <div className={cn('flex gap-4 rounded-xl border border-neutral-200 bg-white overflow-hidden hover:shadow-card-hover transition-shadow', className)}>
        <div className="relative w-48 shrink-0 bg-neutral-100">
          {isPlaceholder ? (
            <div className="w-full h-full min-h-[120px] bg-neutral-200 flex items-center justify-center text-neutral-400 text-xs">Foto a definir</div>
          ) : (
            <img src={fotoUrl} alt={imovel.titulo} className="w-full h-full object-cover" loading="lazy" />
          )}
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-neutral-900 text-sm leading-tight line-clamp-2">{imovel.titulo}</h3>
            {imovel.rankingScore && <BadgeRanking classificacao={imovel.oportunidade ? 'Boa Oportunidade' : 'Preço Justo'} />}
          </div>
          <p className="text-xs text-neutral-500">{imovel.bairro.nome} · {imovel.cidade.nome}</p>
          <p className="text-xl font-bold text-brand-600">{formatCurrency(imovel.preco)}</p>
          <div className="flex gap-3 text-xs text-neutral-600">
            {imovel.quartos > 0 && <span>{imovel.quartos} qtos</span>}
            {imovel.banheiros > 0 && <span>{imovel.banheiros} bans</span>}
            <span>{formatArea(imovel.areaTotal)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden hover:shadow-card-hover transition-all duration-200 group', className)}>
      <div className="relative h-48 bg-neutral-100 overflow-hidden">
        {isPlaceholder ? (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 text-xs">Foto a definir</div>
        ) : (
          <img
            src={fotoUrl}
            alt={imovel.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {imovel.destaque && <Badge variant="destaque">Destaque</Badge>}
          {imovel.oportunidade && <Badge variant="oportunidade">Oportunidade</Badge>}
          {imovel.novo && <Badge variant="novo">Novo</Badge>}
          {imovel.elegivelMcmv && <Badge variant="mcmv">MCMV</Badge>}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
          {imovel.titulo}
        </h3>
        <p className="text-xs text-neutral-500 flex items-center gap-1">
          <span>📍</span>
          {imovel.bairro.nome}, {imovel.cidade.nome}
        </p>
        <p className="text-xl font-bold text-brand-600 mt-auto">{formatCurrency(imovel.preco)}</p>
        <div className="flex gap-3 text-xs text-neutral-600 border-t border-neutral-100 pt-2 mt-1">
          {imovel.quartos > 0 && <span className="flex items-center gap-1">🛏 {imovel.quartos}</span>}
          {imovel.banheiros > 0 && <span className="flex items-center gap-1">🚿 {imovel.banheiros}</span>}
          {imovel.vagas > 0 && <span className="flex items-center gap-1">🚗 {imovel.vagas}</span>}
          <span className="ml-auto font-medium">{formatArea(imovel.areaTotal)}</span>
        </div>
      </div>
    </div>
  )
}
