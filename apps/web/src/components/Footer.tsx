import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  const ano = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="container-imov py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex flex-col items-center md:items-start gap-2">
            <Image src="/logo.png" alt="IMOV Imobiliária" width={100} height={34} className="h-8 w-auto brightness-0 invert opacity-80" />
            <p className="text-xs text-neutral-500">
              Inteligência imobiliária em Fortaleza/CE
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/imoveis" className="hover:text-white transition-colors">Imóveis</Link>
            <Link href="/lancamentos" className="hover:text-white transition-colors">Lançamentos</Link>
            <Link href="/imoveis?oportunidade=true" className="hover:text-white transition-colors">Oportunidades</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          </nav>

          <div className="flex flex-col items-center md:items-end gap-1 text-xs text-neutral-500">
            <p>© {ano} IMOV Imobiliária. Todos os direitos reservados.</p>
            <p>
              Desenvolvido por{' '}
              <a
                href="https://somar.ia.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 transition-colors font-medium"
              >
                Somar Soluções Digitais
              </a>
            </p>
          </div>

        </div>
      </div>
    </footer>
  )
}
