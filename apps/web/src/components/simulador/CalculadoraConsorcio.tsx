'use client'

import { useState, useMemo } from 'react'

// ─── Dados das administradoras ────────────────────────────────────────────────

interface Administradora {
  nome: string
  slug: string
  taxaAdministracao: number | null
  prazoMaximo: number | null
  lanceEmbutidoMax: number | null
  permiteEmbutido: boolean
  lanceMaximoTotal: number | null
  cor: string
  custom?: boolean
}

const ADMINISTRADORAS: Administradora[] = [
  { nome: 'Embracon', slug: 'embracon', taxaAdministracao: 18, prazoMaximo: 200, lanceEmbutidoMax: 25, permiteEmbutido: true, lanceMaximoTotal: 50, cor: '#E8292A' },
  { nome: 'Porto Seguro', slug: 'porto-seguro', taxaAdministracao: 16, prazoMaximo: 180, lanceEmbutidoMax: 30, permiteEmbutido: true, lanceMaximoTotal: 50, cor: '#003087' },
  { nome: 'Caixa', slug: 'caixa', taxaAdministracao: 15, prazoMaximo: 200, lanceEmbutidoMax: 25, permiteEmbutido: true, lanceMaximoTotal: 50, cor: '#005CA9' },
  { nome: 'Sicoob', slug: 'sicoob', taxaAdministracao: 14, prazoMaximo: 180, lanceEmbutidoMax: 20, permiteEmbutido: true, lanceMaximoTotal: 45, cor: '#00883A' },
  { nome: 'Ademicon', slug: 'ademicon', taxaAdministracao: 17, prazoMaximo: 200, lanceEmbutidoMax: 25, permiteEmbutido: true, lanceMaximoTotal: 50, cor: '#FF6B00' },
  { nome: 'Outra', slug: 'custom', taxaAdministracao: null, prazoMaximo: null, lanceEmbutidoMax: null, permiteEmbutido: true, lanceMaximoTotal: null, cor: '#6B7280', custom: true },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function fmtPct(v: number) {
  return v.toFixed(1) + '%'
}

function pmt(taxa: number, n: number, pv: number) {
  if (taxa === 0) return pv / n
  return (pv * taxa * Math.pow(1 + taxa, n)) / (Math.pow(1 + taxa, n) - 1)
}

function estimativaContemplacao(pct: number): string {
  if (pct >= 50) return '4 a 8 meses'
  if (pct >= 40) return '8 a 14 meses'
  if (pct >= 30) return '14 a 24 meses'
  if (pct >= 20) return '24 a 36 meses'
  return '36 a 60 meses'
}

function corBarra(pct: number): string {
  if (pct >= 40) return 'bg-green-500'
  if (pct >= 25) return 'bg-yellow-500'
  return 'bg-orange-400'
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props { whatsapp: string; apiUrl: string }

const inputCls = 'w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-neutral-50 disabled:text-neutral-400'

export function CalculadoraConsorcio({ whatsapp, apiUrl }: Props) {
  const [adminSlug, setAdminSlug] = useState('embracon')
  const admin = ADMINISTRADORAS.find(a => a.slug === adminSlug)!

  const [taxa, setTaxa] = useState(String(admin.taxaAdministracao ?? ''))
  const [prazo, setPrazo] = useState(String(admin.prazoMaximo ?? ''))
  const [embutidoMax, setEmbutidoMax] = useState(String(admin.lanceEmbutidoMax ?? ''))
  const [lanceMaxTotal, setLanceMaxTotal] = useState(String(admin.lanceMaximoTotal ?? ''))
  const [valorCarta, setValorCarta] = useState(500000)
  const [lanceProprio, setLanceProprio] = useState('')
  const [fgts, setFgts] = useState('')
  const [prazoDesejado, setPrazoDesejado] = useState('200')

  function selecionarAdmin(slug: string) {
    setAdminSlug(slug)
    const a = ADMINISTRADORAS.find(x => x.slug === slug)!
    if (!a.custom) {
      setTaxa(String(a.taxaAdministracao ?? ''))
      setPrazo(String(a.prazoMaximo ?? ''))
      setEmbutidoMax(String(a.lanceEmbutidoMax ?? ''))
      setLanceMaxTotal(String(a.lanceMaximoTotal ?? ''))
    }
  }

  const resultado = useMemo(() => {
    const t = parseFloat(taxa) || 0
    const pr = parseInt(prazoDesejado) || parseInt(prazo) || 200
    const emb = parseFloat(embutidoMax) || 0
    const maxTotal = parseFloat(lanceMaxTotal) || 100
    const prop = parseFloat(lanceProprio) || 0
    const fg = parseFloat(fgts) || 0

    const valorComTaxa = valorCarta * (1 + t / 100)
    const parcelaBruta = valorComTaxa / pr
    const lanceEmbutido = valorCarta * (emb / 100)
    const lanceTotal = lanceEmbutido + prop + fg
    const pctLance = (lanceTotal / valorCarta) * 100
    const excedeLimite = pctLance > maxTotal

    // Parcelas restantes após abater lance embutido
    const parcelasAbatidas = lanceEmbutido / parcelaBruta
    const parcelasRestantes = Math.max(pr - parcelasAbatidas, 1)
    const parcelaEfetiva = valorComTaxa / parcelasRestantes

    const totalConsorcio = parcelaEfetiva * parcelasRestantes + prop + fg

    // Financiamento equivalente (PMT Price)
    const financiado = valorCarta * 0.8
    const entrada = valorCarta * 0.2
    const taxaMensal = Math.pow(1 + 0.105, 1 / 12) - 1
    const parcelaFin = pmt(taxaMensal, 240, financiado)
    const totalFin = parcelaFin * 240 + entrada
    const economia = totalFin - totalConsorcio

    return {
      parcelaBruta, parcelaEfetiva, parcelasRestantes,
      lanceEmbutido, lanceTotal, pctLance, excedeLimite,
      totalConsorcio, totalFin, economia, parcelaFin, entrada,
      prazoUsado: pr,
    }
  }, [taxa, prazo, embutidoMax, lanceMaxTotal, valorCarta, lanceProprio, fgts, prazoDesejado])

  async function handleWhatsApp() {
    const msg = encodeURIComponent(
      `Olá! Simulei na IMOV:\n- Administradora: ${admin.nome}\n- Carta: ${fmt(valorCarta)}\n- Lance embutido: ${fmt(resultado.lanceEmbutido)} (${fmtPct(parseFloat(embutidoMax) || 0)})\n- Lance próprio: ${fmt(parseFloat(lanceProprio) || 0)}\n- FGTS: ${fmt(parseFloat(fgts) || 0)}\n- Lance total: ${fmt(resultado.lanceTotal)} (${fmtPct(resultado.pctLance)})\n- Estimativa: ${estimativaContemplacao(resultado.pctLance)}\nQuero analisar com um especialista.`
    )
    if (apiUrl) {
      fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: 'Simulação Consórcio',
          telefone: '00000000000',
          origem: 'SIMULADOR',
          interesseTipo: 'CONSORCIO',
          faixaPrecoMin: valorCarta * 0.9,
          faixaPrecoMax: valorCarta * 1.1,
          comportamentoJson: {
            administradora: admin.nome,
            valorCarta,
            lanceProprio: parseFloat(lanceProprio) || 0,
            fgts: parseFloat(fgts) || 0,
            lanceTotal: resultado.lanceTotal,
            pctLance: resultado.pctLance,
          },
        }),
      }).catch(() => {})
    }
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 md:py-12">
      <div className="container-imov max-w-4xl mx-auto px-4">

        <div className="text-center mb-10">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-neutral-900">
            Calculadora de Consórcio Imobiliário
          </h1>
          <p className="text-neutral-500 mt-2">
            Escolha a administradora e simule sua estratégia de lance em tempo real
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Coluna esquerda: inputs ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Bloco 1: Administradora */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h2 className="font-bold text-neutral-900 mb-4">1. Escolha a administradora</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ADMINISTRADORAS.map(a => (
                  <button
                    key={a.slug}
                    onClick={() => selecionarAdmin(a.slug)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      adminSlug === a.slug
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: a.cor }} />
                    {a.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* Bloco 2: Dados da administradora */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h2 className="font-bold text-neutral-900 mb-4">2. Condições da administradora</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Taxa de adm. (%)', val: taxa, set: setTaxa },
                  { label: 'Prazo máximo (meses)', val: prazo, set: setPrazo },
                  { label: 'Lance embutido máx. (%)', val: embutidoMax, set: setEmbutidoMax },
                  { label: 'Lance total máx. (%)', val: lanceMaxTotal, set: setLanceMaxTotal },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">{field.label}</label>
                    <input
                      type="number"
                      value={field.val}
                      onChange={e => field.set(e.target.value)}
                      disabled={!admin.custom}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
              {admin.custom && (
                <p className="text-xs text-brand-600 mt-2">✏️ Preencha com os dados do seu contrato</p>
              )}
            </div>

            {/* Bloco 3: Dados do usuário */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h2 className="font-bold text-neutral-900 mb-4">3. Seus dados</h2>

              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Valor da carta de crédito: <span className="text-brand-600 font-bold">{fmt(valorCarta)}</span>
                </label>
                <input
                  type="range" min={100000} max={2000000} step={10000}
                  value={valorCarta}
                  onChange={e => setValorCarta(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>R$ 100k</span><span>R$ 2M</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Lance próprio (R$)</label>
                  <input type="number" value={lanceProprio} onChange={e => setLanceProprio(e.target.value)} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">FGTS disponível (R$)</label>
                  <input type="number" value={fgts} onChange={e => setFgts(e.target.value)} placeholder="0" className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Prazo desejado</label>
                  <select value={prazoDesejado} onChange={e => setPrazoDesejado(e.target.value)} className={inputCls}>
                    {[60, 100, 150, 180, 200].map(p => (
                      <option key={p} value={p}>{p} meses ({Math.round(p / 12)} anos)</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Coluna direita: resultado ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Card estratégia IMOV */}
            <div className="bg-[#0d2545] rounded-2xl p-5 text-white">
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">Estratégia IMOV</p>
              <p className="text-sm text-blue-100 leading-relaxed">
                Com lance de{' '}
                <span className="font-bold text-white">{fmt(resultado.lanceTotal)}</span>{' '}
                ({fmtPct(resultado.pctLance)}), sua estimativa de contemplação é de{' '}
                <span className="font-bold text-brand-300">{estimativaContemplacao(resultado.pctLance)}</span>
                {resultado.pctLance >= 25 && ' — bem antes do prazo médio sem lance.'}
              </p>
            </div>

            {/* Composição do lance */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h3 className="font-bold text-neutral-900 mb-3 text-sm">Composição do lance</h3>
              <div className="space-y-2 text-sm">
                <Linha label="Lance embutido" val={fmt(resultado.lanceEmbutido)} cor="text-brand-600" />
                <Linha label="Lance próprio" val={fmt(parseFloat(lanceProprio) || 0)} />
                <Linha label="FGTS" val={fmt(parseFloat(fgts) || 0)} />
                <div className="border-t pt-2 mt-2">
                  <Linha label="Lance total" val={`${fmt(resultado.lanceTotal)} (${fmtPct(resultado.pctLance)})`} bold />
                </div>
              </div>

              {resultado.excedeLimite && (
                <p className="text-xs text-red-500 mt-2 font-medium">
                  ⚠️ Lance excede o limite da administradora ({lanceMaxTotal}%)
                </p>
              )}

              {/* Barra de contemplação */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-neutral-500 mb-1">
                  <span>Estimativa de contemplação</span>
                  <span className="font-semibold">{estimativaContemplacao(resultado.pctLance)}</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${corBarra(resultado.pctLance)}`}
                    style={{ width: `${Math.min(resultado.pctLance * 2, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Parcelas */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h3 className="font-bold text-neutral-900 mb-3 text-sm">Parcelas</h3>
              <div className="space-y-2 text-sm">
                <Linha label="Parcela bruta" val={fmt(resultado.parcelaBruta)} />
                <Linha label={`Parcela efetiva (${Math.round(resultado.parcelasRestantes)} meses)`} val={fmt(resultado.parcelaEfetiva)} bold />
              </div>
            </div>

            {/* Resumo financeiro */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h3 className="font-bold text-neutral-900 mb-3 text-sm">Resumo financeiro</h3>
              <div className="space-y-2 text-sm">
                <Linha label="Total no consórcio" val={fmt(resultado.totalConsorcio)} />
                <Linha label="Total no financiamento" val={fmt(resultado.totalFin)} cor="text-red-500" />
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Você economiza</span>
                    <span className={`text-lg font-bold ${resultado.economia > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {fmt(Math.abs(resultado.economia))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-brand-500 rounded-2xl p-5 text-white">
              <p className="font-bold text-base mb-1">Quer validar esse plano?</p>
              <p className="text-brand-200 text-xs mb-4">
                Nossa consultoria verifica assembleias ativas e a melhor janela para sua contemplação.
              </p>
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Falar com especialista
              </button>
            </div>
          </div>
        </div>

        {/* Aviso legal */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 text-center">
          ⚠️ Valores estimados com base em médias de mercado. Taxas, prazos e percentuais de lance variam por grupo e assembleia.
          Consulte sempre as condições do contrato da administradora escolhida.
          A IMOV não é representante oficial de nenhuma administradora listada.
        </div>
      </div>
    </div>
  )
}

function Linha({ label, val, bold, cor }: { label: string; val: string; bold?: boolean; cor?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-neutral-500">{label}</span>
      <span className={`${bold ? 'font-bold text-neutral-900' : 'font-semibold text-neutral-700'} ${cor ?? ''}`}>{val}</span>
    </div>
  )
}
