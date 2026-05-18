import Link from 'next/link'

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

const CATEGORIA_LABEL: Record<string, string> = {
  FINANCIAMENTO: 'Financiamento',
  CONSORCIO: 'Consórcio',
  DOCUMENTACAO: 'Documentação',
  MCMV: 'Minha Casa Minha Vida',
  INVESTIMENTO: 'Investimento',
  MERCADO: 'Mercado',
  DICAS: 'Dicas',
}

const ARTIGOS_FALLBACK = [
  { slug: '#', titulo: 'Como financiar seu imóvel em 2024', categoria: 'FINANCIAMENTO', tempoLeituraMinutos: 8 },
  { slug: '#', titulo: 'MCMV: quem pode e como funciona', categoria: 'MCMV', tempoLeituraMinutos: 6 },
  { slug: '#', titulo: 'Documentação para compra de imóvel', categoria: 'DOCUMENTACAO', tempoLeituraMinutos: 5 },
]

interface Artigo {
  id?: string
  slug: string
  titulo: string
  categoria: string
  tempoLeituraMinutos: number | null
  imagemCapaUrl?: string | null
}

async function getArtigos(): Promise<Artigo[]> {
  try {
    const res = await fetch(`${API}/artigos?limit=3`, { next: { revalidate: 600 } })
    if (!res.ok) return ARTIGOS_FALLBACK
    const json = await res.json()
    const data = json.data ?? []
    return data.length > 0 ? data : ARTIGOS_FALLBACK
  } catch {
    return ARTIGOS_FALLBACK
  }
}

export async function ArtigosSection() {
  const artigos = await getArtigos()

  return (
    <section className="py-20 bg-white">
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
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {artigos.map((artigo, i) => (
            <Link
              key={artigo.id ?? i}
              href={artigo.slug !== '#' ? `/blog/${artigo.slug}` : '/blog'}
              className="group block bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
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
                {artigo.tempoLeituraMinutos && (
                  <p className="text-xs text-neutral-400 mt-2">
                    {artigo.tempoLeituraMinutos} min de leitura
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ArtigosSkeleton() {
  return (
    <section className="py-20 bg-white">
      <div className="container-imov">
        <div className="mb-10">
          <div className="h-4 w-40 bg-neutral-200 rounded animate-pulse mb-3" />
          <div className="h-8 w-80 bg-neutral-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
              <div className="h-40 bg-neutral-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-neutral-200 rounded w-24" />
                <div className="h-4 bg-neutral-200 rounded w-full" />
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
