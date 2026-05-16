import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IMOV Imobiliária — Inteligência Imobiliária em Fortaleza',
  description:
    'Portal imobiliário com inteligência de mercado em Fortaleza e região metropolitana. Compare bairros, simule financiamento e encontre o imóvel ideal.',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="container-imov py-24 text-center">
        <h1 className="font-display text-4xl font-bold text-neutral-900 md:text-5xl">
          Encontre seu imóvel ideal em{' '}
          <span className="text-brand-500">Fortaleza</span>
        </h1>
        <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
          Inteligência de mercado + as melhores oportunidades da região metropolitana de Fortaleza.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/imoveis"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
          >
            Ver Imóveis
          </a>
          <a
            href="/lancamentos"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-brand-500 text-brand-500 font-semibold hover:bg-brand-50 transition-colors"
          >
            Lançamentos
          </a>
        </div>
      </section>
    </main>
  )
}
