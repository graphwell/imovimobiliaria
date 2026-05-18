'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

const SIMULADORES = [
  { href: '/simulador/consorcio', label: 'Calculadora de Consórcio' },
  { href: '/comparador/consorcio-vs-financiamento', label: 'Financiamento vs Consórcio' },
  { href: '/simulador/financiamento', label: 'Simulador de Financiamento' },
]

export function Header() {
  const pathname = usePathname()
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openDrop() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setDropOpen(true)
  }

  function closeDrop() {
    closeTimer.current = setTimeout(() => setDropOpen(false), 150)
  }

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="container-imov flex items-center justify-between h-16">

        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Image src="/logo.png" alt="IMOV Imobiliária" width={180} height={60} className="h-14 w-auto" priority />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <Link href="/imoveis" className="hover:text-brand-500 transition-colors">Imóveis</Link>
          <Link href="/lancamentos" className="hover:text-brand-500 transition-colors">Lançamentos</Link>
          <Link href="/imoveis?oportunidade=true" className="hover:text-brand-500 transition-colors">Oportunidades</Link>

          {/* Dropdown Simuladores */}
          <div className="relative" onMouseEnter={openDrop} onMouseLeave={closeDrop}>
            <button className={`flex items-center gap-1 hover:text-brand-500 transition-colors ${dropOpen ? 'text-brand-500' : ''}`}>
              Simuladores
              <svg className={`w-3.5 h-3.5 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-xl border border-neutral-200 shadow-lg py-1 z-50">
                {SIMULADORES.map(s => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    onClick={() => setDropOpen(false)}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/imoveis"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            Buscar Imóveis
          </Link>

          {/* Hamburguer mobile */}
          <button className="md:hidden p-2 rounded-lg hover:bg-neutral-100" onClick={() => setMobileOpen(o => !o)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-4 py-3 space-y-1">
          {[
            { href: '/imoveis', label: 'Imóveis' },
            { href: '/lancamentos', label: 'Lançamentos' },
            { href: '/imoveis?oportunidade=true', label: 'Oportunidades' },
            ...SIMULADORES,
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/imoveis"
              className="block w-full text-center px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Buscar Imóveis
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
