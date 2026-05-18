'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminApi, type AdminLead } from '../../../lib/admin-api'

const STATUS_OPTS = ['NOVO','CONTATADO','QUALIFICADO','PROPOSTA','FECHADO','PERDIDO']
const STATUS_COLOR: Record<string, string> = {
  NOVO: 'bg-blue-100 text-blue-700', CONTATADO: 'bg-yellow-100 text-yellow-700',
  QUALIFICADO: 'bg-green-100 text-green-700', PROPOSTA: 'bg-purple-100 text-purple-700',
  FECHADO: 'bg-success-50 text-success-600', PERDIDO: 'bg-danger-50 text-danger-600',
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-success-50 text-success-600' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-neutral-100 text-neutral-600'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{score}</span>
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [obsModal, setObsModal] = useState<{ id: string; obs: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page) }
      if (filtroStatus) params['statusCrm'] = filtroStatus
      const res = await adminApi.leads.list(params)
      setLeads(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, filtroStatus])

  useEffect(() => { load() }, [load])

  async function handleStatus(id: string, statusCrm: string) {
    await adminApi.leads.updateStatus(id, statusCrm)
    load()
  }

  async function saveObs() {
    if (!obsModal) return
    await adminApi.leads.updateObs(obsModal.id, obsModal.obs)
    setObsModal(null)
    load()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Leads</h1>
          <p className="text-sm text-neutral-500">{total} leads cadastrados</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 mb-4 p-3 flex flex-wrap gap-3">
        <select
          value={filtroStatus}
          onChange={e => { setFiltroStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0)+s.slice(1).toLowerCase()}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-xs text-neutral-500 border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium">Contato</th>
                <th className="text-left py-3 px-4 font-medium">Imóvel / Bairro</th>
                <th className="text-left py-3 px-4 font-medium">Score</th>
                <th className="text-left py-3 px-4 font-medium">Origem</th>
                <th className="text-left py-3 px-4 font-medium">Status CRM</th>
                <th className="text-left py-3 px-4 font-medium">Data</th>
                <th className="text-right py-3 px-4 font-medium">Obs</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-neutral-400 text-sm">Carregando...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-neutral-400 text-sm">Nenhum lead encontrado</td></tr>
              ) : leads.map(lead => (
                <tr key={lead.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-neutral-900 text-sm">{lead.nome}</p>
                    <p className="text-xs text-neutral-500">{lead.telefone}</p>
                    {lead.email && <p className="text-xs text-neutral-400">{lead.email}</p>}
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600">
                    {lead.imovel?.titulo ?? lead.bairroInteresse?.nome ?? '—'}
                  </td>
                  <td className="py-3 px-4">
                    <ScoreBadge score={lead.score} />
                  </td>
                  <td className="py-3 px-4 text-xs text-neutral-500">{lead.origem}</td>
                  <td className="py-3 px-4">
                    <select
                      value={lead.statusCrm}
                      onChange={e => handleStatus(lead.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_COLOR[lead.statusCrm] ?? 'bg-neutral-100 text-neutral-600'}`}
                    >
                      {STATUS_OPTS.map(s => (
                        <option key={s} value={s}>{s.charAt(0)+s.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-xs text-neutral-500">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setObsModal({ id: lead.id, obs: lead.observacoes ?? '' })}
                      className={`text-lg transition-opacity ${lead.observacoes ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
                      title="Observações"
                    >
                      📝
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <p className="text-sm text-neutral-500">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p-1)} disabled={page === 1} className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg disabled:opacity-40">← Anterior</button>
              <button onClick={() => setPage(p => p+1)} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg disabled:opacity-40">Próxima →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal observações */}
      {obsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-modal">
            <h3 className="font-bold text-neutral-900 mb-3">Observações</h3>
            <textarea
              value={obsModal.obs}
              onChange={e => setObsModal({ ...obsModal, obs: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={4}
              placeholder="Adicione observações sobre este lead..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setObsModal(null)} className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">Cancelar</button>
              <button onClick={saveObs} className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
