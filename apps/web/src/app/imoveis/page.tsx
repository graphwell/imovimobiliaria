import type { Metadata } from 'next'
import Link from 'next/link'
import { CardImovel } from '@imov/ui'
import type { ImovelListItem, PaginatedResponse } from '@imov/types'

export const metadata: Metadata = {
  title: 'Imóveis em Fortaleza — Apartamentos, Casas e Terrenos',
  description: 'Busque apartamentos, casas, terrenos e coberturas em Fortaleza e região metropolitana. Filtros por tipo, bairro e preço.',
}

const TIPOS = ['APARTAMENTO', 'CASA', 'TERRENO', 'KITNET', 'COBERTURA', 'COMERCIAL'] as const
const TIPOS_LABEL: Record<string, string> = {
  APARTAMENTO: 'Apartamento',
  CASA: 'Casa',
  TERRENO: 'Terreno',
  KITNET: 'Kitnet',
  COBERTURA: 'Cobertura',
  COMERCIAL: 'Comercial',
}

async function getImoveis(searchParams: Record<string, string>) {
  const params = new URLSearchParams()
  if (searchParams['tipo']) params.set('tipo', searchParams['tipo'])
  if (searchParams['modalidade']) params.set('modalidade', searchParams['modalidade'])
  if (searchParams['quartos']) params.set('quartos', searchParams['quartos'])
  if (searchParams['ordenar']) params.set('ordenar', searchParams['ordenar'])
  if (searchParams['page']) params.set('page', searchParams['page'])

  try {
    const res = await fetch(
      `${process.env['NEXT_PUBLIC_API_URL']}/imoveis?${params.toString()}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return { data: [], total: 0, page: 1, totalPages: 1, limit: 20 }
    return res.json() as Promise<PaginatedResponse<ImovelListItem>>
  } catch {
    return { data: [], total: 0, page: 1, totalPages: 1, limit: 20 }
  }
}

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const { data: imoveis, total, totalPages, page } = await getImoveis(searchParams)
  const tipoAtivo = searchParams['tipo']

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-imov py-8">

        <div className="mb-6">
          <Link href="/" className="text-sm text-brand-500 hover:underline">← Início</Link>
          <h1 className="text-2xl font-bold text-neutral-900 mt-2">Imóveis em Fortaleza</h1>
          <p className="text-neutral-500 mt-1">{total} imóvel{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/imoveis"
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !tipoAtivo ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-neutral-700 border-neutral-200 hover:border-brand-500'
            }`}
          >
            Todos
          </Link>
          {TIPOS.map(tipo => (
            <Link
              key={tipo}
              href={tipoAtivo === tipo ? '/imoveis' : `/imoveis?tipo=${tipo}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                tipoAtivo === tipo
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-brand-500'
              }`}
            >
              {TIPOS_LABEL[tipo]}
            </Link>
          ))}
        </div>

        {imoveis.length === 0 ? (
          <div className="text-center py-24 text-neutral-500">
            <p className="text-lg">Nenhum imóvel encontrado.</p>
            <Link href="/imoveis" className="text-brand-500 hover:underline mt-2 inline-block">Ver todos</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {imoveis.map(imovel => (
                <Link key={imovel.id} href={`/imoveis/${imovel.slug}`} className="block">
                  <CardImovel imovel={{ ...imovel, preco: Number(imovel.preco), areaTotal: Number(imovel.areaTotal) }} />
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={`/imoveis?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                    className="px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm hover:border-brand-500"
                  >
                    ← Anterior
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-neutral-500">
                  Página {page} de {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/imoveis?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                    className="px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm hover:border-brand-500"
                  >
                    Próxima →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
