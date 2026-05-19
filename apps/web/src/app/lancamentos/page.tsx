import type { Metadata } from 'next'
import Link from 'next/link'
import { CardImovel } from '@imov/ui'
import type { ImovelListItem, PaginatedResponse } from '@imov/types'

export const metadata: Metadata = {
  title: 'Lançamentos Imobiliários em Fortaleza',
  description: 'Conheça os novos lançamentos imobiliários em Fortaleza e região metropolitana. Apartamentos e casas na planta.',
}

async function getLancamentos(): Promise<PaginatedResponse<ImovelListItem>> {
  try {
    const res = await fetch(
      `${process.env['NEXT_PUBLIC_API_URL']}/imoveis?novo=true&ordenar=mais_recente`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return { data: [], total: 0, page: 1, totalPages: 1, limit: 20 }
    return res.json()
  } catch {
    return { data: [], total: 0, page: 1, totalPages: 1, limit: 20 }
  }
}

export default async function LancamentosPage() {
  const { data: imoveis, total } = await getLancamentos()

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-imov py-8">

        <div className="mb-6">
          <Link href="/" className="text-sm text-brand-500 hover:underline">← Início</Link>
          <h1 className="text-2xl font-bold text-neutral-900 mt-2">Lançamentos em Fortaleza</h1>
          <p className="text-neutral-500 mt-1">{total} lançamento{total !== 1 ? 's' : ''} disponível{total !== 1 ? 'is' : ''}</p>
        </div>

        {imoveis.length === 0 ? (
          <div className="text-center py-24 text-neutral-500">
            <p className="text-lg">Nenhum lançamento disponível no momento.</p>
            <Link href="/imoveis" className="text-brand-500 hover:underline mt-2 inline-block">Ver todos os imóveis</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {imoveis.map(imovel => (
              <Link key={imovel.id} href={`/imoveis/${imovel.slug}`} className="block">
                <CardImovel imovel={{ ...imovel, preco: Number(imovel.preco), areaTotal: Number(imovel.areaTotal) }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
