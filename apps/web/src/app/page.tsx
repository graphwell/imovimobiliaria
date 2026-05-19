import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SearchBar } from '../components/SearchBar'
import { IntentCards } from '../components/home/IntentCards'
import { WhatsAppCTA } from '../components/home/WhatsAppCTA'
import { ImoveisDestaqueSection, ImoveisDestaqueSkeleton } from '../components/home/ImoveisDestaqueSection'
import { BairrosSection, BairrosSkeleton } from '../components/home/BairrosSection'
import { ArtigosSection, ArtigosSkeleton } from '../components/home/ArtigosSection'

export const metadata: Metadata = {
  title: 'IMOV Imobiliária — Inteligência Imobiliária em Fortaleza',
  description:
    'Portal imobiliário com inteligência de mercado em Fortaleza e região metropolitana. Comprar, investir, financiar ou Minha Casa Minha Vida.',
}

const METRICAS = [
  { valor: 'R$ 6.800/m²', label: 'Preço médio Fortaleza', icone: '📊' },
  { valor: '+5,2%', label: 'Valorização 12 meses', icone: '📈' },
  { valor: 'Cocó', label: 'Bairro em alta', icone: '🔥' },
  { valor: '15 imóveis', label: 'Disponíveis agora', icone: '🏠' },
]

export default function HomePage() {
  const whatsapp = process.env['NEXT_PUBLIC_WHATSAPP_NUMBER'] ?? '5585999999999'
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://imov.somar.ia.br'

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'IMOV Imobiliária',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Portal imobiliário com inteligência de mercado em Fortaleza e região metropolitana.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Fortaleza',
      addressRegion: 'CE',
      addressCountry: 'BR',
    },
    areaServed: { '@type': 'City', name: 'Fortaleza' },
  }

  const schemaWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'IMOV Imobiliária',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/imoveis?busca={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebsite) }} />
    <main>

      {/* ─── HERO ─── */}
      {/* Para usar foto real: coloque a imagem em apps/web/public/hero.jpg e troque o fundo abaixo */}
      <section className="relative min-h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1628]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d2545] to-[#0a1628]" />
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #1B4FD8 0%, transparent 70%)' }}
        />

        <div className="relative z-10 container-imov py-20 w-full">
          <div className="text-center text-white max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6 backdrop-blur-sm">
              Inteligência Imobiliária · Fortaleza/CE
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Encontre seu imóvel ideal em{' '}
              <span className="text-brand-400">Fortaleza</span>
            </h1>

            <p className="mt-5 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">
              Diga o que você busca e encontramos as melhores opções para você
            </p>
          </div>

          {/* Cards de intenção */}
          <div className="mt-4">
            <p className="text-center text-white/60 text-sm font-medium uppercase tracking-wider mb-4">
              O que você está buscando?
            </p>
            <IntentCards />
          </div>

          {/* Busca secundária */}
          <div className="mt-6 max-w-lg mx-auto">
            <p className="text-center text-white/50 text-xs mb-3">
              Ou busque diretamente por bairro...
            </p>
            <SearchBar compact />
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="text-brand-400 font-bold">15+</span> Imóveis disponíveis
            </span>
            <span className="text-white/20 hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-brand-400 font-bold">10</span> Bairros mapeados
            </span>
            <span className="text-white/20 hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-brand-400 font-bold">5</span> Cidades
            </span>
          </div>
        </div>
      </section>

      {/* ─── IMÓVEIS EM DESTAQUE (Suspense) ─── */}
      <Suspense fallback={<ImoveisDestaqueSkeleton />}>
        <ImoveisDestaqueSection />
      </Suspense>

      {/* ─── BAIRROS (Suspense) ─── */}
      <Suspense fallback={<BairrosSkeleton />}>
        <BairrosSection />
      </Suspense>

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

      {/* ─── ARTIGOS (Suspense) ─── */}
      <Suspense fallback={<ArtigosSkeleton />}>
        <ArtigosSection />
      </Suspense>

      {/* ─── CTA WHATSAPP (Client — lê sessionStorage) ─── */}
      <WhatsAppCTA numero={whatsapp} />

    </main>
    </>
  )
}
