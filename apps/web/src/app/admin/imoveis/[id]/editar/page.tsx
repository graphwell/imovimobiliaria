'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ImovelForm } from '../../../../../components/admin/ImovelForm'
import { adminApi } from '../../../../../lib/admin-api'

export default function EditarImovelPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    // Tenta GET /admin/imoveis/:id primeiro; se não existir, cai para a listagem
    adminApi.imoveis.get(params.id)
      .then(res => setData(res.data as unknown as Record<string, unknown>))
      .catch(() => {
        // fallback: busca pela listagem
        return adminApi.imoveis.list({ page: '1', limit: '100' })
          .then(res => {
            const imovel = res.data.find(i => i.id === params.id)
            if (imovel) setData(imovel as unknown as Record<string, unknown>)
            else setErro('Imóvel não encontrado')
          })
          .catch(() => setErro('Erro ao carregar imóvel'))
      })
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="flex items-center justify-center h-64 text-neutral-400">Carregando...</div>
  if (erro || !data) return <div className="flex items-center justify-center h-64 text-neutral-400">{erro || 'Imóvel não encontrado'}</div>

  return (
    <div>
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/admin/imoveis" className="text-sm text-brand-500 hover:underline">← Voltar</Link>
        <h1 className="text-xl font-bold text-neutral-900 mt-2">Editar Imóvel</h1>
        <p className="text-sm text-neutral-500">{String(data['titulo'] ?? '')}</p>
      </div>
      <ImovelForm initialData={data} imovelId={params.id} />
    </div>
  )
}
