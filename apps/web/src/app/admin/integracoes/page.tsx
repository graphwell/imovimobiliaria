'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '../../../lib/admin-api'

interface IntegrationStatus {
  ok: boolean
  error?: string
  spreadsheetId?: string
  url?: string
}

interface Status {
  sheets: IntegrationStatus
  gmail: IntegrationStatus
  analytics: IntegrationStatus
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">✓ Ativo</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">✗ Inativo</span>
}

function IntCard({
  icon, title, status, extra, onTest, testing,
}: {
  icon: string
  title: string
  status?: IntegrationStatus
  extra?: React.ReactNode
  onTest: () => void
  testing: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-semibold text-neutral-900 text-sm">{title}</p>
            {status && <div className="mt-0.5"><StatusBadge ok={status.ok} /></div>}
          </div>
        </div>
        <button
          onClick={onTest}
          disabled={testing}
          className="text-xs px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors disabled:opacity-50"
        >
          {testing ? 'Testando...' : 'Testar'}
        </button>
      </div>
      {status?.error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-2">{status.error}</p>
      )}
      {extra}
    </div>
  )
}

export default function IntegracoesPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [linhas, setLinhas] = useState<string[][]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<Record<string, boolean>>({})

  const loadStatus = useCallback(async () => {
    try {
      const res = await adminApi.integracoes.status()
      setStatus(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const loadLinhas = useCallback(async () => {
    try {
      const res = await adminApi.integracoes.sheetsLinhas()
      setLinhas(res.data)
    } catch {}
  }, [])

  useEffect(() => {
    Promise.all([loadStatus(), loadLinhas()]).finally(() => setLoading(false))
  }, [loadStatus, loadLinhas])

  async function testar(service: string) {
    setTesting(t => ({ ...t, [service]: true }))
    await loadStatus()
    if (service === 'sheets') await loadLinhas()
    setTesting(t => ({ ...t, [service]: false }))
  }

  const HEADERS = ['Data', 'Nome', 'Telefone', 'Email', 'Origem', 'Interesse', 'Bairro', 'Preço Min', 'Preço Max', 'Score', 'Status CRM', 'UTM']

  if (loading) return <div className="flex items-center justify-center h-64 text-neutral-400">Carregando...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Integrações Google</h1>
        <p className="text-sm text-neutral-500 mt-1">Status em tempo real das integrações com serviços Google.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <IntCard
          icon="📊"
          title="Google Sheets"
          status={status?.sheets}
          onTest={() => testar('sheets')}
          testing={!!testing['sheets']}
          extra={
            status?.sheets.url
              ? <a href={status.sheets.url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline mt-2 block">Abrir planilha ↗</a>
              : null
          }
        />
        <IntCard
          icon="📧"
          title="Gmail / SMTP"
          status={status?.gmail}
          onTest={() => testar('gmail')}
          testing={!!testing['gmail']}
        />
        <IntCard
          icon="📈"
          title="Google Analytics 4"
          status={status?.analytics}
          onTest={() => testar('analytics')}
          testing={!!testing['analytics']}
        />
      </div>

      {/* Últimas linhas da planilha */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900 text-sm">Últimos leads na planilha</h2>
          <button onClick={loadLinhas} className="text-xs text-brand-500 hover:underline">Atualizar</button>
        </div>
        {linhas.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">Nenhuma linha disponível</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100">
                  {HEADERS.map(h => (
                    <th key={h} className="text-left py-2 px-3 font-medium text-neutral-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((row, i) => (
                  <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50">
                    {HEADERS.map((_, j) => (
                      <td key={j} className="py-2 px-3 text-neutral-700 whitespace-nowrap">{row[j] ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-neutral-50 rounded-xl text-xs text-neutral-500 space-y-1">
        <p><strong>Sheets:</strong> Requer <code>secrets/google-service-account.json</code> + <code>GOOGLE_SHEETS_ID</code> no .env (criado automaticamente na 1ª execução).</p>
        <p><strong>Gmail:</strong> Requer <code>SMTP_USER</code>, <code>SMTP_PASS</code> (Senha de App Gmail) e <code>ADMIN_EMAIL</code>.</p>
        <p><strong>Analytics:</strong> Requer <code>GA4_MEASUREMENT_ID</code> e <code>GA4_API_SECRET</code>.</p>
      </div>
    </div>
  )
}
