import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CardImovel } from '@imov/ui'
import type { ImovelDetalhe, ImovelListItem } from '@imov/types'

interface DetalheResponse {
  data: ImovelDetalhe
  similares: ImovelListItem[]
}

async function getImovel(slug: string): Promise<DetalheResponse | null> {
  try {
    const res = await fetch(
      `${process.env['NEXT_PUBLIC_API_URL']}/imoveis/${slug}`,
      { next: { revalidate: 300 } }
    )
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getImovel(params.slug)
  if (!result) return { title: 'Imóvel não encontrado' }
  const { data: imovel } = result
  return {
    title: imovel.metaTitle ?? imovel.titulo,
    description: imovel.metaDescription ?? imovel.descricao?.slice(0, 160),
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
}

export default async function ImovelDetalhePage({ params }: { params: { slug: string } }) {
  const result = await getImovel(params.slug)
  if (!result) notFound()

  const { data: imovel, similares } = result
  const preco = Number(imovel.preco)
  const fotos = Array.isArray(imovel.fotos) ? imovel.fotos : []
  const fotoCapa = fotos.find(f => f.tipo === 'capa') ?? fotos[0]
  const temFotoReal = fotoCapa?.url && !fotoCapa.url.startsWith('[')

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-imov py-8">

        <nav className="text-sm text-neutral-500 mb-4 flex gap-2">
          <Link href="/" className="hover:text-brand-500">Início</Link>
          <span>/</span>
          <Link href="/imoveis" className="hover:text-brand-500">Imóveis</Link>
          <span>/</span>
          <span className="text-neutral-700 line-clamp-1">{imovel.titulo}</span>
        </nav>

        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="h-64 md:h-96 bg-neutral-200 flex items-center justify-center">
            {temFotoReal ? (
              <img src={fotoCapa!.url} alt={imovel.titulo} className="w-full h-full object-cover" />
            ) : (
              <p className="text-neutral-400 text-sm">Fotos em breve</p>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{imovel.titulo}</h1>
                <p className="text-neutral-500 mt-1">📍 {imovel.bairro.nome}, {imovel.cidade.nome}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-brand-600">{formatCurrency(preco)}</p>
                {imovel.modalidade === 'LOCACAO' && <p className="text-sm text-neutral-500">/mês</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-neutral-50 rounded-xl">
              {imovel.quartos > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{imovel.quartos}</p>
                  <p className="text-xs text-neutral-500">Quartos</p>
                </div>
              )}
              {imovel.banheiros > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{imovel.banheiros}</p>
                  <p className="text-xs text-neutral-500">Banheiros</p>
                </div>
              )}
              {imovel.vagas > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{imovel.vagas}</p>
                  <p className="text-xs text-neutral-500">Vagas</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-900">{Number(imovel.areaTotal)}m²</p>
                <p className="text-xs text-neutral-500">Área total</p>
              </div>
            </div>

            {imovel.descricao && !imovel.descricao.startsWith('[') && (
              <div className="mt-6">
                <h2 className="font-semibold text-neutral-900 mb-2">Descrição</h2>
                <p className="text-neutral-600 leading-relaxed">{imovel.descricao}</p>
              </div>
            )}

            {imovel.diferenciais?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-neutral-900 mb-3">Diferenciais</h2>
                <div className="flex flex-wrap gap-2">
                  {imovel.diferenciais.map(d => (
                    <span key={d} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm">{d}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {imovel.aceitaFinanciamento && <span className="px-3 py-1 bg-success-50 text-success-600 rounded-full">✓ Aceita Financiamento</span>}
              {imovel.aceitaFgts && <span className="px-3 py-1 bg-success-50 text-success-600 rounded-full">✓ Aceita FGTS</span>}
              {imovel.elegivelMcmv && <span className="px-3 py-1 bg-success-50 text-success-600 rounded-full">✓ Minha Casa Minha Vida</span>}
            </div>

            <div className="mt-8 p-4 bg-warning-50 rounded-xl text-xs text-neutral-600">
              ⚠️ Indicadores baseados em estimativas automatizadas. Não constituem avaliação técnica oficial.
            </div>
          </div>
        </div>

        {similares.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Similares no bairro</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similares.map(s => (
                <Link key={s.id} href={`/imoveis/${s.slug}`} className="block">
                  <CardImovel imovel={{ ...s, preco: Number(s.preco), areaTotal: Number(s.areaTotal) }} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
