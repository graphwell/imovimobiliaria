'use client'

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

function push(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(event)
}

export const gtm = {
  leadCaptured(data: { origem: string; imovelSlug?: string; bairroSlug?: string; score: number }) {
    push({ event: 'lead_captured', ...data })
  },
  whatsappClicked(data: { contexto: string; imovelSlug?: string; bairroSlug?: string }) {
    push({ event: 'whatsapp_click', ...data })
  },
  imovelViewed(data: { slug: string; titulo: string; bairro: string; preco: number; tipo: string }) {
    push({ event: 'imovel_view', ...data })
  },
  searchPerformed(data: { filtros: Record<string, unknown>; totalResultados: number }) {
    push({ event: 'search_performed', ...data })
  },
  simuladorUsed(data: { valorImovel: number; entrada: number; prazo: number; parcela: number }) {
    push({ event: 'simulador_used', ...data })
  },
  bairroViewed(data: { slug: string; nome: string }) {
    push({ event: 'bairro_view', ...data })
  },
  empreendimentoViewed(data: { slug: string; construtora: string }) {
    push({ event: 'empreendimento_view', ...data })
  },
  artigoRead(data: { slug: string; categoria: string; tempoLeitura?: number }) {
    push({ event: 'artigo_read', ...data })
  },
}
