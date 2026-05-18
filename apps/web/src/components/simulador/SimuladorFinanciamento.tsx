'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function pmt(taxa: number, n: number, pv: number) {
  if (taxa === 0) return pv / n
  return (pv * taxa * Math.pow(1 + taxa, n)) / (Math.pow(1 + taxa, n) - 1)
}

const SISTEMAS = [
  { id: 'price', label: 'Tabela Price (parcelas fixas)' },
  { id: 'sac', label: 'SAC (parcelas decrescentes)' },
]

const inputCls = 'w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

export function SimuladorFinanciamento({ whatsapp }: { whatsapp: string }) {
  const [valor, setValor] = useState(500000)
  const [entradaPct, setEntradaPct] = useState(20)
  const [taxaAnual, setTaxaAnual] = useState(10.5)
  const [prazo, setPrazo] = useState(240)
  const [sistema, setSistema] = useState('price')

  const r = useMemo(() => {
    const entrada = valor * (entradaPct / 100)
    const financiado = valor - entrada
    const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1

    if (sistema === 'price') {
      const parcela = pmt(taxaMensal, prazo, financiado)
      const totalPago = parcela * prazo + entrada
      return {
        entrada, financiado, parcela, parcelaFinal: parcela,
        totalPago, jurosTotais: totalPago - valor,
        primeiraParcelaText: fmt(parcela),
        ultimaParcelaText: fmt(parcela),
      }
    } else {
      // SAC: amortização fixa
      const amortizacao = financiado / prazo
      const primeiraJuros = financiado * taxaMensal
      const primeiraParcela = amortizacao + primeiraJuros
      const ultimaJuros = (amortizacao) * taxaMensal
      const ultimaParcela = amortizacao + ultimaJuros
      // Total SAC
      let total = entrada
      for (let i = 1; i <= prazo; i++) {
        const saldo = financiado - amortizacao * (i - 1)
        total += amortizacao + saldo * taxaMensal
      }
      return {
        entrada, financiado, parcela: primeiraParcela, parcelaFinal: ultimaParcela,
        totalPago: total, jurosTotais: total - valor,
        primeiraParcelaText: fmt(primeiraParcela),
        ultimaParcelaText: fmt(ultimaParcela),
      }
    }
  }, [valor, entradaPct, taxaAnual, prazo, sistema])

  const msg = encodeURIComponent(
    `Olá! Simulei um financiamento na IMOV:\n- Imóvel: ${fmt(valor)}\n- Entrada: ${fmt(r.entrada)} (${entradaPct}%)\n- Taxa: ${taxaAnual}% aa\n- Prazo: ${prazo} meses\n- Parcela: ${r.primeiraParcelaText}\nQuero conversar com um especialista.`
  )

  return (
    <div className="min-h-screen bg-neutral-50 py-8 md:py-12">
      <div className="container-imov max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-neutral-900">Simulador de Financiamento</h1>
          <p className="text-neutral-500 mt-2">Calcule sua parcela pela Tabela Price ou SAC</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Valor do imóvel: <span className="text-brand-600 font-bold">{fmt(valor)}</span>
              </label>
              <input type="range" min={100000} max={2000000} step={10000} value={valor}
                onChange={e => setValor(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Entrada ({entradaPct}%)</label>
              <input type="range" min={10} max={50} step={5} value={entradaPct}
                onChange={e => setEntradaPct(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-brand-500" />
              <div className="flex justify-between text-xs text-neutral-400 mt-1"><span>10%</span><span>50%</span></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Taxa de juros anual (%)</label>
              <input type="number" value={taxaAnual} step={0.1} onChange={e => setTaxaAnual(parseFloat(e.target.value) || 0)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Prazo (meses)</label>
              <select value={prazo} onChange={e => setPrazo(Number(e.target.value))} className={inputCls}>
                {[60, 120, 180, 240, 300, 360].map(p => <option key={p} value={p}>{p} meses ({p / 12} anos)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2">Sistema de amortização</label>
              <div className="flex gap-2">
                {SISTEMAS.map(s => (
                  <button key={s.id} onClick={() => setSistema(s.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${sistema === s.id ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-400'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-brand-500 rounded-2xl p-6 text-white">
              <p className="text-brand-200 text-xs uppercase tracking-wider mb-1">
                {sistema === 'price' ? 'Parcela mensal fixa' : 'Primeira parcela'}
              </p>
              <p className="text-4xl font-bold">{r.primeiraParcelaText}</p>
              {sistema === 'sac' && (
                <p className="text-brand-200 text-sm mt-1">Última: {r.ultimaParcelaText}</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 text-sm">
              {[
                { l: 'Entrada', v: fmt(r.entrada) },
                { l: 'Valor financiado', v: fmt(r.financiado) },
                { l: 'Total pago', v: fmt(r.totalPago) },
                { l: 'Juros totais', v: fmt(r.jurosTotais), cor: 'text-red-500' },
              ].map(item => (
                <div key={item.l} className="flex justify-between">
                  <span className="text-neutral-500">{item.l}</span>
                  <span className={`font-semibold ${item.cor ?? 'text-neutral-800'}`}>{item.v}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              💡 Compare com consórcio e economize{' '}
              <Link href="/simulador/consorcio" className="font-bold underline">até {fmt(r.jurosTotais)}</Link> em juros.
            </div>

            <a href={`https://wa.me/${whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Falar com especialista
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          ⚠️ Simulação baseada na Tabela Price/SAC. Taxas reais variam por banco, perfil e análise de crédito.
        </p>
      </div>
    </div>
  )
}
