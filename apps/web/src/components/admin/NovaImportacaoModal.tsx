'use client'

import { useState } from 'react'
import { pipelineApi } from '../../lib/pipeline-api'

interface Props {
  onClose: () => void
  onCreated: (id: string) => void
}

const SOURCE_TYPES = [
  { value: 'GOOGLE_DRIVE', label: 'Google Drive' },
  { value: 'HTTP_URL', label: 'URL HTTP (zip ou imagem)' },
  { value: 'DROPBOX', label: 'Dropbox' },
]

export default function NovaImportacaoModal({ onClose, onCreated }: Props) {
  const [sourceType, setSourceType] = useState('GOOGLE_DRIVE')
  const [sourceUrl, setSourceUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const placeholder =
    sourceType === 'GOOGLE_DRIVE'
      ? 'https://drive.google.com/drive/folders/...'
      : sourceType === 'DROPBOX'
        ? 'https://www.dropbox.com/sh/...'
        : 'https://exemplo.com/fotos.zip'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sourceUrl.trim()) { setError('Informe a URL'); return }
    setError('')
    setLoading(true)
    try {
      const res = await pipelineApi.importacoes.create(sourceUrl.trim(), sourceType)
      onCreated(res.id)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao criar importação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-base font-semibold text-neutral-900">Nova Importação</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Fonte</label>
            <select
              value={sourceType}
              onChange={e => setSourceType(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SOURCE_TYPES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">URL</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Criando...' : 'Iniciar Importação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
