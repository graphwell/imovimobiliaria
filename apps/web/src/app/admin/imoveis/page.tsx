'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { adminApi, type AdminImovel } from '../../../lib/admin-api'
import NovaImportacaoModal from '../../../components/admin/NovaImportacaoModal'

const STATUS_COLOR: Record<string, string> = {
  DISPONIVEL: 'bg-green-100 text-green-700',
  VENDIDO: 'bg-neutral-100 text-neutral-600',
  ALUGADO: 'bg-blue-100 text-blue-700',
  RESERVADO: 'bg-yellow-100 text-yellow-700',
  INATIVO: 'bg-red-100 text-red-600',
}

export default function AdminImoveisPage() {
  const [imoveis, setImoveis] = useState<AdminImovel[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [importModal, setImportModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page) }
      if (filtroStatus) params['status'] = filtroStatus
      if (filtroTipo) params['tipo'] = filtroTipo
      const res = await adminApi.imoveis.list(params)
      setImoveis(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, filtroStatus, filtroTipo])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string, titulo: string) {
    if (!confirm(`Desativar "${titulo}"?`)) return
    await adminApi.imoveis.delete(id)
    load()
  }

  async function handleStatus(id: string, status: string) {
    await adminApi.imoveis.updateStatus(id, status)
    load()
  }

  async function handleDestaque(id: string, destaque: boolean) {
    await adminApi.imoveis.toggleDestaque(id, destaque)
    load()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Imóveis</h1>
          <p className="text-sm text-neutral-500">{total} imóveis cadastrados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setImportModal(true)}
            className="px-4 py-2 text-sm font-semibold text-brand-600 border border-brand-200 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
          >
            📥 Importar do Drive
          </button>
          <Link href="/admin/imoveis/novo" className="px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors">
            + Novo Imóvel
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 mb-4 p-3 flex flex-wrap gap-3">
        <select
          value={filtroStatus}
          onChange={e => { setFiltroStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todos os status</option>
          <option value="DISPONIVEL">Disponível</option>
          <option value="VENDIDO">Vendido</option>
          <option value="ALUGADO">Alugado</option>
          <option value="RESERVADO">Reservado</option>
          <option value="INATIVO">Inativo</option>
        </select>
        <select
          value={filtroTipo}
          onChange={e => { setFiltroTipo(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todos os tipos</option>
          {['APARTAMENTO','CASA','TERRENO','COBERTURA','COMERCIAL','KITNET'].map(t => (
            <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-xs text-neutral-500 border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium">Imóvel</th>
                <th className="text-left py-3 px-4 font-medium">Tipo</th>
                <th className="text-left py-3 px-4 font-medium">Preço</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Destaque</th>
                <th className="text-right py-3 px-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-neutral-400 text-sm">Carregando...</td></tr>
              ) : imoveis.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-neutral-400 text-sm">Nenhum imóvel encontrado</td></tr>
              ) : imoveis.map(imovel => (
                <tr key={imovel.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-neutral-900 text-sm line-clamp-1">{imovel.titulo}</p>
                    <p className="text-xs text-neutral-500">{imovel.bairro.nome} · {imovel.areaTotal}m²</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600">
                    {imovel.tipo.charAt(0)+imovel.tipo.slice(1).toLowerCase()}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-brand-600">
                    {new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(imovel.preco))}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={imovel.status}
                      onChange={e => handleStatus(imovel.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_COLOR[imovel.status] ?? ''}`}
                    >
                      {['DISPONIVEL','VENDIDO','ALUGADO','RESERVADO','INATIVO'].map(s => (
                        <option key={s} value={s}>{s.charAt(0)+s.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDestaque(imovel.id, !imovel.destaque)}
                      className={`text-lg transition-opacity ${imovel.destaque ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
                      title={imovel.destaque ? 'Remover destaque' : 'Marcar como destaque'}
                    >
                      ⭐
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/imoveis/${imovel.slug}`}
                        target="_blank"
                        className="px-2 py-1 text-xs text-neutral-500 hover:text-brand-500 border border-neutral-200 rounded-lg transition-colors"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/imoveis/${imovel.id}/editar`}
                        className="px-2 py-1 text-xs text-neutral-600 hover:text-brand-500 border border-neutral-200 rounded-lg transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(imovel.id, imovel.titulo)}
                        className="px-2 py-1 text-xs text-red-400 hover:text-red-600 border border-neutral-200 rounded-lg transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
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
              <button onClick={() => setPage(p => p-1)} disabled={page === 1} className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-brand-500 transition-colors">
                ← Anterior
              </button>
              <button onClick={() => setPage(p => p+1)} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-brand-500 transition-colors">
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>

      {importModal && (
        <NovaImportacaoModal
          onClose={() => setImportModal(false)}
          onCreated={() => {
            setImportModal(false)
            window.location.href = '/admin/importacoes'
          }}
        />
      )}
    </div>
  )
}
