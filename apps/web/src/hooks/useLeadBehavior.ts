'use client'

import { useEffect, useRef } from 'react'
import type { ComportamentoNavegacao } from '@imov/types'

const STORAGE_KEY = 'imov_comportamento'

function getStoredBehavior(): ComportamentoNavegacao {
  if (typeof window === 'undefined') return getDefaultBehavior()
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as ComportamentoNavegacao) : getDefaultBehavior()
  } catch {
    return getDefaultBehavior()
  }
}

function getDefaultBehavior(): ComportamentoNavegacao {
  return {
    bairrosVisitados: [],
    imoveisVisitados: [],
    tiposBuscados: [],
    faixaPrecoExplorada: null,
    quartosExplorados: [],
    tempoSessaoSegundos: 0,
    paginasVisitadas: 0,
  }
}

function saveBehavior(data: ComportamentoNavegacao) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage pode estar cheio
  }
}

export function useLeadBehavior() {
  const startTime = useRef(Date.now())

  useEffect(() => {
    const behavior = getStoredBehavior()
    behavior.paginasVisitadas = (behavior.paginasVisitadas ?? 0) + 1
    saveBehavior(behavior)
  }, [])

  function registrarImovelVisto(imovel: { slug: string; titulo: string; preco: number; bairro: string }) {
    const behavior = getStoredBehavior()
    const jaExiste = behavior.imoveisVisitados.some(i => i.slug === imovel.slug)
    if (!jaExiste) {
      behavior.imoveisVisitados = [imovel, ...behavior.imoveisVisitados].slice(0, 10)
    }
    if (!behavior.bairrosVisitados.includes(imovel.bairro)) {
      behavior.bairrosVisitados = [...behavior.bairrosVisitados, imovel.bairro].slice(0, 20)
    }
    saveBehavior(behavior)
  }

  function registrarBusca(filtros: { tipo?: string; quartos?: number; precoMin?: number; precoMax?: number }) {
    const behavior = getStoredBehavior()
    if (filtros.tipo && !behavior.tiposBuscados.includes(filtros.tipo)) {
      behavior.tiposBuscados = [...behavior.tiposBuscados, filtros.tipo]
    }
    if (filtros.quartos != null && !behavior.quartosExplorados.includes(filtros.quartos)) {
      behavior.quartosExplorados = [...behavior.quartosExplorados, filtros.quartos]
    }
    if (filtros.precoMin != null || filtros.precoMax != null) {
      behavior.faixaPrecoExplorada = {
        min: filtros.precoMin ?? behavior.faixaPrecoExplorada?.min ?? 0,
        max: filtros.precoMax ?? behavior.faixaPrecoExplorada?.max ?? 9999999,
      }
    }
    saveBehavior(behavior)
  }

  function obterParaLead(): ComportamentoNavegacao {
    const behavior = getStoredBehavior()
    behavior.tempoSessaoSegundos = Math.round((Date.now() - startTime.current) / 1000)
    return behavior
  }

  return { registrarImovelVisto, registrarBusca, obterParaLead }
}
