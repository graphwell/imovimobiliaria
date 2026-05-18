'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, type DashboardMetricas, type AdminLead } from '../../../lib/admin-api'

const STATUS_LABEL: Record<string, string> = {
  NOVO: 'Novo', CONTATADO: 'Contatado', QUALIFICADO: 'Qualificado',
  PROPOSTA: 'Proposta', FECHADO: 'Fechado', PERDIDO: 'Perdido',
}
const STATUS_COLOR: Record<string, string> = {
  NOVO: 'bg-blue-100 text-blue-700', CONTATADO: 'bg-yellow-100 text-yellow-700',
  QUALIFICADO: 'bg-green-100 text-green-700', PROPOSTA: 'bg-purple-100 text-purple-700',
  FECHADO: 'bg-success-50 text-success-600', PERDIDO: 'bg-danger-50 text-danger-600',
}

function MetricCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

function LeadRow({ lead }: { lead: AdminLead }) {
  return (
    <tr className="border-b border-neutral-100 hover:bg-neutral-50">
      <td className="py-3 px-4">
        <p className="font-medium text-neutral-900 text-sm">{lead.nome}</p>
        <p className="text-xs text-neutral-500">{lead.telefone}</p>
      </td>
      <td className="py-3 px-4 text-sm text-neutral-600">{lead.imovel?.titulo ?? '—'}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[lead.statusCrm] ?? 'bg-neutral-100 text-neutral-600'}`}>
          {STATUS_LABEL[lead.statusCrm] ?? lead.statusCrm}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-neutral-500">
        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
      </td>
    </tr>
  )
}

export default function DashboardPage() {
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.dashboard()
      .then(res => setMetricas(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-neutral-400">Carregando...</div>
  )

  if (!metricas) return (
    <div className="flex items-center justify-center h-64 text-neutral-400">Erro ao carregar métricas.</div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
        <Link href="/admin/imoveis/novo" className="px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors">
          + Novo Imóvel
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Imóveis ativos" value={metricas.imoveisAtivos} sub={`${metricas.totalImoveis} total`} icon="🏠" />
        <MetricCard label="Leads hoje" value={metricas.leadsHoje} sub={`${metricas.leadsSemana} esta semana`} icon="📥" />
        <MetricCard label="Taxa qualificação" value={`${metricas.taxaQualificacao}%`} icon="✅" />
        <MetricCard label="Total imóveis" value={metricas.totalImoveis} icon="📋" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold text-neutral-900 mb-3 text-sm">Leads por origem</h2>
          <div className="flex flex-col gap-2">
            {metricas.leadsPorOrigem.length === 0 && <p className="text-sm text-neutral-400">Nenhum dado</p>}
            {metricas.leadsPorOrigem.map(item => (
              <div key={item.origem} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">{item.origem}</span>
                <span className="text-sm font-bold text-neutral-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold text-neutral-900 mb-3 text-sm">Leads por status</h2>
          <div className="flex flex-col gap-2">
            {metricas.leadsPorStatus.length === 0 && <p className="text-sm text-neutral-400">Nenhum dado</p>}
            {metricas.leadsPorStatus.map(item => (
              <div key={item.status} className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[item.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
                <span className="text-sm font-bold text-neutral-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold text-neutral-900 mb-3 text-sm">Ações rápidas</h2>
          <div className="flex flex-col gap-2">
            <Link href="/admin/imoveis/novo" className="flex items-center gap-2 px-3 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm hover:bg-brand-100 transition-colors">
              <span>🏠</span> Cadastrar imóvel
            </Link>
            <Link href="/admin/imoveis" className="flex items-center gap-2 px-3 py-2 bg-neutral-50 text-neutral-700 rounded-lg text-sm hover:bg-neutral-100 transition-colors">
              <span>📋</span> Ver todos os imóveis
            </Link>
            <Link href="/admin/leads" className="flex items-center gap-2 px-3 py-2 bg-neutral-50 text-neutral-700 rounded-lg text-sm hover:bg-neutral-100 transition-colors">
              <span>👥</span> Gerenciar leads
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900 text-sm">Últimos leads</h2>
          <Link href="/admin/leads" className="text-sm text-brand-500 hover:underline">Ver todos</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-neutral-500 border-b border-neutral-100">
                <th className="text-left py-2 px-4 font-medium">Nome</th>
                <th className="text-left py-2 px-4 font-medium">Imóvel</th>
                <th className="text-left py-2 px-4 font-medium">Status</th>
                <th className="text-left py-2 px-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {metricas.ultimosLeads.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-sm text-neutral-400">Nenhum lead ainda</td></tr>
              ) : (
                metricas.ultimosLeads.map(lead => <LeadRow key={lead.id} lead={lead} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
