import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CardImovel, CardBairro, CardImovelSkeleton } from '@imov/ui'
import type { ImovelListItem, BairroListItem } from '@imov/types'
import { SearchBar } from '../components/SearchBar'

export const metadata: Metadata = {
  title: 'IMOV Imobiliária — Inteligência Imobiliária em Fortaleza',
  description:
    'Portal imobiliário com inteligência de mercado em Fortaleza e região metropolitana. Compare bairros, simule financiamento e encontre o imóvel ideal.',
}

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

async function getImoveisDestaque(): Promise<ImovelListItem[]> {
  try {
    const res = await fetch(`${API}/imoveis?destaque=true&limit=6`, { next: { revalidate: 120 } })
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

interface Artigo {
  id: string
  slug: string
  titulo: string
  categoria: string
  tempoLeituraMinutos: number | null
  imagemCapaUrl: string | null
}

async function getArtigos(): Promise<Artigo[]> {
  try {
    const res = await fetch(`${API}/artigos?limit=3`, { next: { revalidate: 600 } })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

const CATEGORIA_LABEL: Record<string, string> = {
  FINANCIAMENTO: 'Financiamento',
  CONSORCIO: 'Consórcio',
  DOCUMENTACAO: 'Documentação',
  MCMV: 'Minha Casa Minha Vida',
  INVESTIMENTO: 'Investimento',
  MERCADO: 'Mercado',
  DICAS: 'Dicas',
}

const METRICAS = [
  { valor: 'R$ 6.800/m²', label: 'Preço médio Fortaleza', icone: '📊' },
  { valor: '+5,2%', label: 'Valorização 12 meses', icone: '📈' },
  { valor: 'Cocó', label: 'Bairro em alta', icone: '🔥' },
  { valor: '15 imóveis', label: 'Disponíveis agora', icone: '🏠' },
]

export default async function HomePage() {
  const [imoveis, bairros, artigos] = await Promise.all([
    getImoveisDestaque(),
    getBairros(),
    getArtigos(),
  ])

  const whatsapp = process.env['NEXT_PUBLIC_WHATSAPP_NUMBER'] ?? '5585999999999'

  return (
    <main>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[680px] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1590577976322-3d2d6a2130a5?auto=format&fit=crop&w=1920&q=80"
          alt="Vista aérea de Fortaleza"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/75 via-neutral-900/60 to-neutral-900/80" />

        <div className="relative z-10 container-imov py-24 w-full text-center text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/30 border border-brand-400/40 text-brand-200 text-sm font-medium mb-6 backdrop-blur-sm">
            Inteligência Imobiliária · Fortaleza/CE
          </span>

          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto">
            Encontre seu imóvel ideal em{' '}
            <span className="text-brand-400">Fortaleza</span>
          </h1>

          <p className="mt-5 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">
            Inteligência de mercado + as melhores oportunidades da região metropolitana
          </p>

          <SearchBar />

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-neutral-300">
            <span className="flex items-center gap-1.5">
              <span className="text-brand-400 font-bold">15+</span> Imóveis disponíveis
            </span>
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-brand-400 font-bold">10</span> Bairros
            </span>
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-brand-400 font-bold">5</span> Cidades
            </span>
          </div>
        </div>
      </section>

      {/* ─── IMÓVEIS EM DESTAQUE ─── */}
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

          {imoveis.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <CardImovelSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {imoveis.map(imovel => (
                <Link key={imovel.id} href={`/imoveis/${imovel.slug}`} className="block group">
                  <CardImovel imovel={imovel} />
                </Link>
              ))}
            </div>
          )}

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

      {/* ─── BAIRROS POPULARES ─── */}
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

          {bairros.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bairros.map(bairro => (
                <Link key={bairro.id} href={`/bairros/${bairro.slug}`} className="block">
                  <CardBairro bairro={bairro} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── ÍNDICE DE MERCADO ─── */}
      <section className="py-20 bg-white">
        <div className="container-imov">
          <div className="text-center mb-12">
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-2">
              Dados do mercado
            </p>
            <h2 className="font-display text-3xl font-bold text-neutral-900">
              Mercado Imobiliário — Fortaleza
            </h2>
            <p className="text-neutral-500 mt-2">
              Indicadores da cidade e tendências regionais
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {METRICAS.map(m => (
              <div
                key={m.label}
                className="bg-white rounded-2xl border border-neutral-100 shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <span className="text-3xl">{m.icone}</span>
                <p className="font-display text-2xl font-bold text-neutral-900 mt-3">{m.valor}</p>
                <p className="text-sm text-neutral-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-neutral-400">
            ⚠️ Dados estimados. Atualização mensal. Não constituem avaliação técnica oficial.
          </p>
        </div>
      </section>

      {/* ─── CENTRAL EDUCACIONAL ─── */}
      <section className="py-20 bg-neutral-50">
        <div className="container-imov">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-2">
                Aprenda antes de comprar
              </p>
              <h2 className="font-display text-3xl font-bold text-neutral-900">
                Guia do Comprador Imobiliário
              </h2>
              <p className="text-neutral-500 mt-2">
                Tudo que você precisa saber sobre financiamento, documentação e mercado
              </p>
            </div>
            <Link
              href="/blog"
              className="hidden md:inline-flex items-center gap-1 text-brand-500 font-medium text-sm hover:text-brand-600 transition-colors"
            >
              Ver todos os artigos →
            </Link>
          </div>

          {artigos.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { titulo: 'Como financiar seu imóvel em 2024', categoria: 'FINANCIAMENTO', tempo: 8 },
                { titulo: 'MCMV: quem pode e como funciona', categoria: 'MCMV', tempo: 6 },
                { titulo: 'Documentação para compra de imóvel', categoria: 'DOCUMENTACAO', tempo: 5 },
              ].map((artigo, i) => (
                <div key={i} className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                    <span className="text-5xl">📖</span>
                  </div>
                  <div className="p-5">
                    <span className="inline-block px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full mb-3">
                      {CATEGORIA_LABEL[artigo.categoria] ?? artigo.categoria}
                    </span>
                    <h3 className="font-bold text-neutral-900 leading-snug group-hover:text-brand-600 transition-colors">
                      {artigo.titulo}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2">{artigo.tempo} min de leitura</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {artigos.map(artigo => (
                <Link key={artigo.id} href={`/blog/${artigo.slug}`} className="block group">
                  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                      {artigo.imagemCapaUrl ? (
                        <Image src={artigo.imagemCapaUrl} alt={artigo.titulo} width={400} height={160} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">📖</span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="inline-block px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full mb-3">
                        {CATEGORIA_LABEL[artigo.categoria] ?? artigo.categoria}
                      </span>
                      <h3 className="font-bold text-neutral-900 leading-snug group-hover:text-brand-600 transition-colors">
                        {artigo.titulo}
                      </h3>
                      {artigo.tempoLeituraMinutos && (
                        <p className="text-xs text-neutral-400 mt-2">{artigo.tempoLeituraMinutos} min de leitura</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link href="/blog" className="text-brand-500 font-medium text-sm hover:text-brand-600 transition-colors">
              Ver todos os artigos →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-20 bg-brand-500">
        <div className="container-imov text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Fale com um Especialista IMOV
          </h2>
          <p className="text-brand-200 text-lg mt-4 max-w-xl mx-auto">
            Nossa equipe conhece Fortaleza e vai encontrar o imóvel certo para você
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Vim pelo IMOV e gostaria de falar com um especialista.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-green-500 text-white font-bold text-base hover:bg-green-600 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chamar no WhatsApp
            </a>
            <a
              href="/imoveis"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white text-white font-bold text-base hover:bg-white hover:text-brand-600 transition-colors"
            >
              Ver imóveis disponíveis
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
