import Link from 'next/link'
import { CardBairro } from '@imov/ui'
import type { BairroListItem } from '@imov/types'

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

async function getBairros(): Promise<BairroListItem[]> {
  try {
    const res = await fetch(`${API}/bairros?limit=8`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

export async function BairrosSection() {
  const bairros = await getBairros()
  if (bairros.length === 0) return null

  return (
    <section className="py-20 bg-neutral-50">
      <div className="container-imov">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-2">
              Explore a cidade
            </p>
            <h2 className="font-display text-3xl font-bold text-neutral-900">
              Conheça os Bairros de Fortaleza
            </h2>
            <p className="text-neutral-500 mt-2">
              Perfil, preços e infraestrutura de cada região
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bairros.map(bairro => (
            <Link key={bairro.id} href={`/bairros/${bairro.slug}`} className="block">
              <CardBairro bairro={bairro} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BairrosSkeleton() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="container-imov">
        <div className="mb-10">
          <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-3" />
          <div className="h-8 w-72 bg-neutral-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
              <div className="h-40 bg-neutral-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
