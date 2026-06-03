'use client'

import { useState, useRef } from 'react'

type Foto = { url: string; legenda?: string; ordem: number; tipo: string }

interface GaleriaFotosProps {
  fotos: Foto[]
  titulo: string
}

export function GaleriaFotos({ fotos, titulo }: GaleriaFotosProps) {
  const [atual, setAtual] = useState(0)
  const touchStartX = useRef<number>(0)
  const total = fotos.length

  function prev() { setAtual(i => (i - 1 + total) % total) }
  function next() { setAtual(i => (i + 1) % total) }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]!.clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0]!.clientX - touchStartX.current
    if (dx > 50) prev()
    else if (dx < -50) next()
  }

  if (total === 0) {
    return (
      <div className="h-64 md:h-[480px] bg-neutral-200 flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Fotos em breve</p>
      </div>
    )
  }

  const foto = fotos[atual]!

  return (
    <div className="select-none">
      {/* Foto principal */}
      <div
        className="relative h-64 md:h-[480px] bg-neutral-900 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {foto.url.endsWith('.mp4') ? (
          <video
            src={foto.url}
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={foto.url}
            src={foto.url}
            alt={foto.legenda ?? `${titulo} — foto ${atual + 1}`}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x480?text=Foto' }}
          />
        )}

        {/* Contador */}
        {total > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {atual + 1} / {total}
          </div>
        )}

        {/* Seta anterior */}
        {total > 1 && (
          <button
            onClick={prev}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Seta próxima */}
        {total > 1 && (
          <button
            onClick={next}
            aria-label="Próxima foto"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Miniaturas */}
      {total > 1 && (
        <div className="flex gap-2 p-2 bg-neutral-900 overflow-x-auto">
          {fotos.map((f, i) => (
            <button
              key={f.url}
              onClick={() => setAtual(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`flex-shrink-0 w-16 h-14 md:w-20 md:h-16 rounded overflow-hidden border-2 transition-all ${
                i === atual
                  ? 'border-brand-400 opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              {f.url.endsWith('.mp4') ? (
                <video src={f.url} className="w-full h-full object-cover" muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={f.url}
                  alt={`Miniatura ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
