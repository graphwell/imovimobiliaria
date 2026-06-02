'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ImovelForm } from '../../../../../components/admin/ImovelForm'
import { adminApi, type AdminImovelDetalhe } from '../../../../../lib/admin-api'

export default function EditarImovelPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<AdminImovelDetalhe | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    adminApi.imoveis.get(params.id)
      .then(res => setData(res.data))
      .catch(() => setErro('Imóvel não encontrado'))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="flex items-center justify-center h-64 text-neutral-400">Carregando...</div>
  if (erro || !data) return <div className="flex items-center justify-center h-64 text-neutral-400">{erro || 'Imóvel não encontrado'}</div>

  return (
    <div>
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/admin/imoveis" className="text-sm text-brand-500 hover:underline">← Voltar</Link>
        <h1 className="text-xl font-bold text-neutral-900 mt-2">Editar Imóvel</h1>
        <p className="text-sm text-neutral-500">{data.titulo}</p>
      </div>
      <ImovelForm initialData={data as unknown as Record<string, unknown>} imovelId={params.id} />
    </div>
  )
}
