'use client'

import { useState, useCallback } from 'react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Perfil {
  valorImovel: number
  rendaMensal: string
  temFgts: boolean
  valorFgts: string
  temRecursosProprios: boolean
  valorRecursosProprios: string
  urgencia: 'logo' | '6m' | '1a' | 'sem'
}

interface ResultadoFinanciamento {
  entrada: number
  valorFinanciado: number
  parcelaMensal: number
  totalPago: number
  jurosTotais: number
}

interface ResultadoConsorcio {
  parcela: number
  totalPago: number
  prazoMeses: number
}

interface ResultadoEstrategia {
  parcela: number
  lanceEmbutido: number
  lanceFgts: number
  lanceProprioExtra: number
  lanceTotal: number
  percentualLance: number
  estimativaMin: number
  estimativaMax: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v)
}

function pmt(taxa: number, n: number, pv: number): number {
  if (taxa === 0) return pv / n
  return (pv * taxa * Math.pow(1 + taxa, n)) / (Math.pow(1 + taxa, n) - 1)
}

function calcFinanciamento(valor: number): ResultadoFinanciamento {
  const entrada = valor * 0.2
  const financiado = valor * 0.8
  const taxaAnual = 0.105
  const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1
  const n = 240
  const parcela = pmt(taxaMensal, n, financiado)
  const total = parcela * n + entrada
  return {
    entrada,
    valorFinanciado: financiado,
    parcelaMensal: parcela,
    totalPago: total,
    jurosTotais: total - valor,
  }
}

function calcConsorcioTradicional(valor: number): ResultadoConsorcio {
  const taxaAdm = 0.18
  const prazo = 200
  const parcela = (valor * (1 + taxaAdm)) / prazo
  return { parcela, totalPago: parcela * prazo, prazoMeses: prazo }
}

function calcEstrategia(valor: number, fgts: number, proprio: number): ResultadoEstrategia {
  const taxaAdm = 0.18
  const prazo = 200
  const parcela = (valor * (1 + taxaAdm)) / prazo
  const lanceEmbutido = valor * 0.25
  const lanceTotal = lanceEmbutido + fgts + proprio
  const pct = (lanceTotal / valor) * 100
  let min = 24, max = 36
  if (pct >= 45) { min = 4; max = 8 }
  else if (pct >= 35) { min = 8; max = 14 }
  else if (pct >= 25) { min = 14; max = 24 }
  return {
    parcela,
    lanceEmbutido,
    lanceFgts: fgts,
    lanceProprioExtra: proprio,
    lanceTotal,
    percentualLance: pct,
    estimativaMin: min,
    estimativaMax: max,
  }
}

const URGENCIA_OPTS = [
  { id: 'logo', label: 'Preciso logo' },
  { id: '6m', label: '6 meses' },
  { id: '1a', label: '1 ano' },
  { id: 'sem', label: 'Sem pressa' },
] as const

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ etapa }: { etapa: number }) {
  const etapas = ['Perfil', 'Comparativo', 'Plano', 'Consultoria']
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {etapas.map((e, i) => (
          <div key={e} className="flex items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i + 1 < etapa ? 'bg-brand-500 text-white' :
              i + 1 === etapa ? 'bg-brand-500 text-white ring-4 ring-brand-100' :
              'bg-neutral-200 text-neutral-400'
            }`}>
              {i + 1 < etapa ? '✓' : i + 1}
            </div>
            <span className={`text-xs hidden sm:inline font-medium ${i + 1 === etapa ? 'text-brand-600' : 'text-neutral-400'}`}>
              {e}
            </span>
            {i < 3 && <div className={`flex-1 h-0.5 w-6 sm:w-12 mx-1 rounded ${i + 1 < etapa ? 'bg-brand-500' : 'bg-neutral-200'}`} />}
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500 text-center">Etapa {etapa} de 4</p>
    </div>
  )
}

// ─── Etapa 1: Perfil ─────────────────────────────────────────────────────────

function EtapaPerfil({ perfil, onChange, onNext }: {
  perfil: Perfil
  onChange: (p: Partial<Perfil>) => void
  onNext: () => void
}) {
  const inputCls = 'w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          Valor do imóvel desejado
        </label>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-2xl font-bold text-brand-600 min-w-[160px]">{fmt(perfil.valorImovel)}</span>
        </div>
        <input
          type="range"
          min={150000}
          max={2000000}
          step={10000}
          value={perfil.valorImovel}
          onChange={e => onChange({ valorImovel: Number(e.target.value) })}
          className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-brand-500"
        />
        <div className="flex justify-between text-xs text-neutral-400 mt-1">
          <span>R$ 150 mil</span>
          <span>R$ 2 milhões</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1">Renda familiar mensal</label>
        <input
          type="number"
          value={perfil.rendaMensal}
          onChange={e => onChange({ rendaMensal: e.target.value })}
          placeholder="R$ 0,00"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-neutral-700">FGTS disponível?</label>
            <button
              onClick={() => onChange({ temFgts: !perfil.temFgts })}
              className={`w-12 h-6 rounded-full transition-colors ${perfil.temFgts ? 'bg-brand-500' : 'bg-neutral-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${perfil.temFgts ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          {perfil.temFgts && (
            <input
              type="number"
              value={perfil.valorFgts}
              onChange={e => onChange({ valorFgts: e.target.value })}
              placeholder="Valor do FGTS"
              className={inputCls}
            />
          )}
        </div>

        <div className="border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-neutral-700">Recursos próprios para lance?</label>
            <button
              onClick={() => onChange({ temRecursosProprios: !perfil.temRecursosProprios })}
              className={`w-12 h-6 rounded-full transition-colors ${perfil.temRecursosProprios ? 'bg-brand-500' : 'bg-neutral-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${perfil.temRecursosProprios ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          {perfil.temRecursosProprios && (
            <input
              type="number"
              value={perfil.valorRecursosProprios}
              onChange={e => onChange({ valorRecursosProprios: e.target.value })}
              placeholder="Valor disponível"
              className={inputCls}
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">Urgência</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {URGENCIA_OPTS.map(op => (
            <button
              key={op.id}
              onClick={() => onChange({ urgencia: op.id })}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                perfil.urgencia === op.id
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-brand-400'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors text-base"
      >
        Simular agora →
      </button>
    </div>
  )
}

// ─── Etapa 2: Comparativo ────────────────────────────────────────────────────

function EtapaComparativo({ perfil, fin, cons, est, onNext, onBack }: {
  perfil: Perfil
  fin: ResultadoFinanciamento
  cons: ResultadoConsorcio
  est: ResultadoEstrategia
  onNext: () => void
  onBack: () => void
}) {
  const economia = fin.totalPago - cons.totalPago

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-1">Comparativo para {fmt(perfil.valorImovel)}</h2>
      <p className="text-sm text-neutral-500 mb-6">Análise personalizada baseada no seu perfil</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Financiamento */}
        <div className="border border-neutral-200 rounded-2xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏦</span>
            <h3 className="font-bold text-neutral-900">Financiamento</h3>
          </div>
          <div className="space-y-3 text-sm">
            <Row label="Entrada (20%)" val={fmt(fin.entrada)} />
            <Row label="Parcela mensal" val={fmt(fin.parcelaMensal)} destaque />
            <Row label="Prazo" val="240 meses" />
            <Row label="Total pago" val={fmt(fin.totalPago)} />
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-neutral-500">Juros totais</span>
                <span className="font-bold text-red-500">{fmt(fin.jurosTotais)}</span>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2 text-center">
              <span className="text-xs font-semibold text-orange-600">⚡ Imediato</span>
            </div>
          </div>
        </div>

        {/* Consórcio Tradicional */}
        <div className="border border-neutral-200 rounded-2xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📋</span>
            <h3 className="font-bold text-neutral-900">Consórcio Tradicional</h3>
          </div>
          <div className="space-y-3 text-sm">
            <Row label="Entrada" val="Não exige" />
            <Row label="Parcela mensal" val={fmt(cons.parcela)} destaque />
            <Row label="Prazo" val="200 meses" />
            <Row label="Total pago" val={fmt(cons.totalPago)} />
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-neutral-500">Juros</span>
                <span className="font-bold text-green-600">R$ 0 ✓</span>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 text-center">
              <span className="text-xs font-semibold text-yellow-700">⏱ 2 a 5 anos (sorteio)</span>
            </div>
          </div>
        </div>

        {/* Estratégia IMOV */}
        <div className="border-2 border-brand-500 rounded-2xl p-5 bg-brand-50 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">⭐ Recomendado</span>
          </div>
          <div className="flex items-center gap-2 mb-4 mt-1">
            <span className="text-2xl">🎯</span>
            <h3 className="font-bold text-brand-700">Estratégia IMOV</h3>
          </div>
          <div className="space-y-3 text-sm">
            <Row label="Entrada" val="Não exige" />
            <Row label="Parcela mensal" val={fmt(est.parcela)} destaque />
            <Row label="Lance total" val={`${fmt(est.lanceTotal)} (${est.percentualLance.toFixed(0)}%)`} />
            <Row label="Total pago" val={fmt(cons.totalPago)} />
            <div className="border-t border-brand-200 pt-3">
              <div className="flex justify-between">
                <span className="text-neutral-500">Juros</span>
                <span className="font-bold text-green-600">R$ 0 ✓</span>
              </div>
            </div>
            <div className="bg-brand-500 rounded-lg p-2 text-center">
              <span className="text-xs font-bold text-white">
                🚀 {est.estimativaMin}–{est.estimativaMax} meses
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-6">
        <p className="text-sm text-green-700 font-medium">
          💰 Economia estimada vs financiamento:{' '}
          <span className="text-2xl font-bold text-green-600 ml-1">{fmt(economia)}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
          ← Voltar
        </button>
        <button onClick={onNext} className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors">
          Ver meu plano estratégico →
        </button>
      </div>
    </div>
  )
}

function Row({ label, val, destaque }: { label: string; val: string; destaque?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-neutral-500">{label}</span>
      <span className={destaque ? 'font-bold text-neutral-900 text-base' : 'font-semibold text-neutral-700'}>{val}</span>
    </div>
  )
}

// ─── Etapa 3: Plano ───────────────────────────────────────────────────────────

function EtapaPlano({ perfil, fin, est, onNext, onBack }: {
  perfil: Perfil
  fin: ResultadoFinanciamento
  est: ResultadoEstrategia
  onNext: () => void
  onBack: () => void
}) {
  const economia = fin.totalPago - (est.parcela * (200 - Math.round((est.lanceEmbutido / est.parcela))))

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-1">Seu plano estratégico personalizado</h2>
      <p className="text-sm text-neutral-500 mb-6">Baseado no seu perfil financeiro</p>

      <div className="bg-brand-500 rounded-2xl p-6 text-white mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-brand-200 text-xs uppercase tracking-wider mb-1">Carta de crédito</p>
            <p className="text-2xl font-bold">{fmt(perfil.valorImovel)}</p>
          </div>
          <div>
            <p className="text-brand-200 text-xs uppercase tracking-wider mb-1">Parcela estimada</p>
            <p className="text-2xl font-bold">{fmt(est.parcela)}/mês</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <p className="text-brand-100 text-xs uppercase tracking-wider mb-3 font-semibold">Composição do lance</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-200">Lance embutido (25%)</span>
              <span className="font-bold">{fmt(est.lanceEmbutido)}</span>
            </div>
            {est.lanceFgts > 0 && (
              <div className="flex justify-between">
                <span className="text-brand-200">FGTS</span>
                <span className="font-bold">{fmt(est.lanceFgts)}</span>
              </div>
            )}
            {est.lanceProprioExtra > 0 && (
              <div className="flex justify-between">
                <span className="text-brand-200">Recursos próprios</span>
                <span className="font-bold">{fmt(est.lanceProprioExtra)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
              <span className="font-bold text-white">Lance total</span>
              <span className="font-bold text-lg">{fmt(est.lanceTotal)} ({est.percentualLance.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-brand-200 text-xs mb-1">Contemplação estimada</p>
            <p className="text-xl font-bold">{est.estimativaMin}–{est.estimativaMax} meses</p>
          </div>
          <div className="bg-green-400/20 border border-green-300/30 rounded-xl p-3 text-center">
            <p className="text-green-200 text-xs mb-1">Economia vs financiamento</p>
            <p className="text-xl font-bold text-green-300">{fmt(fin.jurosTotais)}</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-xs text-amber-700">
        ⚠️ Estimativas baseadas em médias de mercado. Condições reais variam por administradora, grupo e histórico de assembleias.
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
          ← Voltar
        </button>
        <button onClick={onNext} className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors">
          Quero meu plano completo →
        </button>
      </div>
    </div>
  )
}

// ─── Etapa 4: CTA ────────────────────────────────────────────────────────────

function EtapaCTA({ perfil, est, whatsapp, onBack }: {
  perfil: Perfil
  est: ResultadoEstrategia
  whatsapp: string
  onBack: () => void
}) {
  const urgLabels: Record<string, string> = {
    logo: 'o mais rápido possível',
    '6m': 'em até 6 meses',
    '1a': 'em até 1 ano',
    sem: 'sem pressa',
  }

  const msg = encodeURIComponent(
    `Olá! Simulei no site da IMOV e tenho interesse em consórcio. Imóvel: ${fmt(perfil.valorImovel)}, Lance disponível: ${fmt(est.lanceTotal)}, Prazo desejado: ${urgLabels[perfil.urgencia] ?? perfil.urgencia}. Quero meu plano estratégico.`
  )

  return (
    <div>
      <div className="bg-brand-500 rounded-2xl p-8 text-center text-white mb-6">
        <div className="text-4xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold mb-3">Quer seu plano estratégico completo?</h2>
        <p className="text-brand-200 mb-6 max-w-md mx-auto">
          Nossa consultoria analisa as melhores administradoras, identifica assembleias com maior chance de contemplação e monta sua estratégia de lance.
        </p>

        <a
          href={`https://wa.me/${whatsapp}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg text-base"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chamar no WhatsApp
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-center text-sm">
        {[
          { icone: '🏆', titulo: 'Melhores administradoras', texto: 'Comparamos taxas e histórico de contemplação' },
          { icone: '📊', titulo: 'Estratégia de lance', texto: 'Calculamos o lance ideal para sua situação' },
          { icone: '⚡', titulo: 'Suporte completo', texto: 'Da simulação até a entrega das chaves' },
        ].map(item => (
          <div key={item.titulo} className="border border-neutral-200 rounded-xl p-4">
            <div className="text-2xl mb-2">{item.icone}</div>
            <p className="font-semibold text-neutral-900 text-sm">{item.titulo}</p>
            <p className="text-neutral-500 text-xs mt-1">{item.texto}</p>
          </div>
        ))}
      </div>

      <button onClick={onBack} className="w-full py-3 border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
        ← Refazer simulação
      </button>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SimuladorComparador({ whatsapp }: { whatsapp: string }) {
  const [etapa, setEtapa] = useState(1)
  const [perfil, setPerfil] = useState<Perfil>({
    valorImovel: 500000,
    rendaMensal: '',
    temFgts: false,
    valorFgts: '',
    temRecursosProprios: false,
    valorRecursosProprios: '',
    urgencia: 'logo',
  })

  const onChange = useCallback((p: Partial<Perfil>) => setPerfil(prev => ({ ...prev, ...p })), [])

  const fgts = perfil.temFgts ? Number(perfil.valorFgts) || 0 : 0
  const proprio = perfil.temRecursosProprios ? Number(perfil.valorRecursosProprios) || 0 : 0

  const fin = calcFinanciamento(perfil.valorImovel)
  const cons = calcConsorcioTradicional(perfil.valorImovel)
  const est = calcEstrategia(perfil.valorImovel, fgts, proprio)

  return (
    <div className="min-h-screen bg-neutral-50 py-8 md:py-12">
      <div className="container-imov max-w-3xl mx-auto px-4">

        <div className="text-center mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-neutral-900">
            Consórcio ou Financiamento?
          </h1>
          <p className="text-neutral-500 mt-2">
            Simule, compare e descubra a melhor estratégia para o seu imóvel
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 md:p-8">
          <ProgressBar etapa={etapa} />

          {etapa === 1 && (
            <EtapaPerfil perfil={perfil} onChange={onChange} onNext={() => setEtapa(2)} />
          )}
          {etapa === 2 && (
            <EtapaComparativo
              perfil={perfil} fin={fin} cons={cons} est={est}
              onNext={() => setEtapa(3)} onBack={() => setEtapa(1)}
            />
          )}
          {etapa === 3 && (
            <EtapaPlano
              perfil={perfil} fin={fin} est={est}
              onNext={() => setEtapa(4)} onBack={() => setEtapa(2)}
            />
          )}
          {etapa === 4 && (
            <EtapaCTA perfil={perfil} est={est} whatsapp={whatsapp} onBack={() => setEtapa(1)} />
          )}
        </div>
      </div>
    </div>
  )
}
