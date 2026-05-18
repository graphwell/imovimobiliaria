import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="container-imov flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="IMOV Imobiliária"
            width={180}
            height={60}
            className="h-14 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <Link href="/imoveis" className="hover:text-brand-500 transition-colors">Imóveis</Link>
          <Link href="/lancamentos" className="hover:text-brand-500 transition-colors">Lançamentos</Link>
          <Link href="/imoveis?oportunidade=true" className="hover:text-brand-500 transition-colors">Oportunidades</Link>
          <Link href="/comparador/consorcio-vs-financiamento" className="hover:text-brand-500 transition-colors">Consórcio</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/imoveis"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            Buscar Imóveis
          </Link>
        </div>
      </div>
    </header>
  )
}
