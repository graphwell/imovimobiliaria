import Link from 'next/link'
import { CardImovel } from '@imov/ui'
import type { ImovelListItem } from '@imov/types'

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

async function getImoveisDestaque(): Promise<ImovelListItem[]> {
  try {
    const res = await fetch(`${API}/imoveis?destaque=true&limit=6`, {
      next: { revalidate: 120 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data ?? []).map((i: ImovelListItem) => ({
      ...i,
      preco: Number(i.preco),
      areaTotal: Number(i.areaTotal),
    }))
  } catch {
    return []
  }
}

export async function ImoveisDestaqueSection() {
  const imoveis = await getImoveisDestaque()
  if (imoveis.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="container-imov">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-2">
              Curadoria IMOV
            </p>
            <h2 className="font-display text-3xl font-bold text-neutral-900">
              Oportunidades Selecionadas
            </h2>
            <p className="text-neutral-500 mt-2">
              Imóveis com melhor custo-benefício em Fortaleza
            </p>
          </div>
          <Link
            href="/imoveis"
            className="hidden md:inline-flex items-center gap-1 text-brand-500 font-medium text-sm hover:text-brand-600 transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {imoveis.map(imovel => (
            <Link key={imovel.id} href={`/imoveis/${imovel.slug}`} className="block">
              <CardImovel imovel={imovel} />
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-medium hover:border-brand-500 hover:text-brand-500 transition-colors"
          >
            Ver todos os imóveis →
          </Link>
        </div>
      </div>
    </section>
  )
}

export function ImoveisDestaqueSkeleton() {
  return (
    <section className="py-20 bg-white">
      <div className="container-imov">
        <div className="mb-10">
          <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-3" />
          <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-neutral-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
                <div className="h-6 bg-neutral-200 rounded w-2/3" />
                <div className="flex gap-3">
                  <div className="h-3 bg-neutral-200 rounded w-12" />
                  <div className="h-3 bg-neutral-200 rounded w-12" />
                  <div className="h-3 bg-neutral-200 rounded w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
