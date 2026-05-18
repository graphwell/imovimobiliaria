'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FILTROS_RAPIDOS = [
  { label: 'Apartamento', param: 'tipo', valor: 'APARTAMENTO' },
  { label: 'Casa', param: 'tipo', valor: 'CASA' },
  { label: 'Lançamento', param: 'novo', valor: 'true' },
  { label: 'Financiamento', param: 'aceitaFinanciamento', valor: 'true' },
  { label: 'MCMV', param: 'elegivelMcmv', valor: 'true' },
]

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    router.push(`/imoveis${params.toString() ? '?' + params.toString() : ''}`)
  }

  function handleFiltro(param: string, valor: string) {
    router.push(`/imoveis?${param}=${valor}`)
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <form onSubmit={handleSubmit} className="flex gap-2 bg-white rounded-xl p-2 shadow-lg">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por bairro, tipo ou código..."
          className="flex-1 px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm outline-none bg-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-brand-500 text-white font-semibold text-sm rounded-lg hover:bg-brand-600 transition-colors shrink-0"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {FILTROS_RAPIDOS.map(f => (
          <button
            key={f.label}
            onClick={() => handleFiltro(f.param, f.valor)}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
