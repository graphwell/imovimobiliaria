'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { adminApi } from '../../../lib/admin-api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OAuthStatus {
  connected: boolean
  email?: string
  expiresAt?: string
  scopes?: string[]
  expired?: boolean
}

interface ServiceStatus {
  ok: boolean
  error?: string
  spreadsheetId?: string
  url?: string
  siteVerified?: boolean
}

interface AllStatus {
  sheets: ServiceStatus
  gmail: ServiceStatus
  analytics: ServiceStatus
}

interface SearchAnalytics {
  totals: { clicks: number; impressions: number; ctr: number; position: number }
  topQueries: { query: string; clicks: number; impressions: number; position: number }[]
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function Badge({ ok, label }: { ok: boolean; label?: string }) {
  return ok
    ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">{label ?? '✓ Ativo'}</span>
    : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">{label ?? '✗ Inativo'}</span>
}

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-neutral-900 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Btn({
  onClick, disabled, variant = 'primary', children,
}: {
  onClick: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger'; children: React.ReactNode
}) {
  const base = 'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50'
  const styles = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  }
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>{children}</button>
}

// ─── Aba: Google OAuth ────────────────────────────────────────────────────────

function GoogleOAuthCard({ oauthStatus, onConnect, onDisconnect, connecting }: {
  oauthStatus: OAuthStatus | null
  onConnect: () => void
  onDisconnect: () => void
  connecting: boolean
}) {
  const SCOPES_LABEL: Record<string, string> = {
    'https://www.googleapis.com/auth/business.manage': 'Google Meu Negócio',
    'https://www.googleapis.com/auth/webmasters': 'Search Console',
    'https://www.googleapis.com/auth/spreadsheets': 'Google Sheets',
    'https://www.googleapis.com/auth/gmail.send': 'Gmail — Enviar emails',
  }

  return (
    <Card title="Conexão Google (OAuth)" icon="🔐">
      {!oauthStatus?.connected ? (
        <div>
          <p className="text-sm text-neutral-500 mb-4">Conecte sua conta Google para habilitar Google Meu Negócio e Search Console.</p>
          <div className="mb-4 space-y-1">
            {Object.entries(SCOPES_LABEL).map(([, label]) => (
              <div key={label} className="flex items-center gap-2 text-xs text-neutral-600">
                <span className="text-brand-500">✓</span> {label}
              </div>
            ))}
          </div>
          <Btn onClick={onConnect} disabled={connecting}>
            {connecting ? 'Redirecionando...' : '→ Conectar com Google'}
          </Btn>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
              {oauthStatus.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{oauthStatus.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge ok={!oauthStatus.expired} label={oauthStatus.expired ? 'Expirado' : 'Conectado'} />
                {oauthStatus.expiresAt && (
                  <span className="text-xs text-neutral-400">Expira: {new Date(oauthStatus.expiresAt).toLocaleDateString('pt-BR')}</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mb-3">Token renovado automaticamente. Só precisa reconectar se revogar manualmente.</p>
          <Btn onClick={onDisconnect} variant="danger">Desconectar</Btn>
        </div>
      )}
    </Card>
  )
}

// ─── Aba: Google Meu Negócio ──────────────────────────────────────────────────

function GoogleBusinessCard({ connected }: { connected: boolean }) {
  const [accounts, setAccounts] = useState<{ name: string; accountName: string }[]>([])
  const [locations, setLocations] = useState<{ name: string; title: string }[]>([])
  const [reviews, setReviews] = useState<{ reviewId?: string; comment?: { text?: string }; starRating?: string; reviewer?: { displayName?: string } }[]>([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (!connected) return
    adminApi.google.businessAccounts()
      .then(r => { setAccounts(r.data); if (r.data[0]) setSelectedAccount(r.data[0].name) })
      .catch(() => {})
  }, [connected])

  useEffect(() => {
    if (!selectedAccount) return
    adminApi.google.businessLocations(selectedAccount)
      .then(r => { setLocations(r.data); if (r.data[0]) setSelectedLocation(r.data[0].name) })
      .catch(() => {})
  }, [selectedAccount])

  async function loadReviews() {
    if (!selectedLocation) return
    setLoading(true)
    try { const r = await adminApi.google.businessReviews(selectedLocation); setReviews(r.data as typeof reviews) }
    finally { setLoading(false) }
  }

  async function postTest() {
    if (!selectedLocation) return
    setPosting(true)
    try { await adminApi.google.businessPost(selectedLocation, 'Novo imóvel disponível! Acesse nosso site para ver as melhores oportunidades em Fortaleza.', 'LEARN_MORE') }
    finally { setPosting(false) }
  }

  async function sendReply(reviewId: string) {
    if (!replyText[reviewId] || !selectedLocation) return
    await adminApi.google.reviewReply(selectedLocation, reviewId, replyText[reviewId]!)
    setReplyText(p => ({ ...p, [reviewId]: '' }))
    await loadReviews()
  }

  if (!connected) return <Card title="Google Meu Negócio" icon="📍"><p className="text-sm text-neutral-400">Conecte o Google OAuth primeiro.</p></Card>

  return (
    <Card title="Google Meu Negócio" icon="📍">
      {accounts.length === 0
        ? <p className="text-sm text-neutral-400">Nenhuma conta Google Meu Negócio encontrada.</p>
        : (
          <div className="space-y-4">
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2"
            >
              {locations.map(l => <option key={l.name} value={l.name}>{l.title}</option>)}
            </select>
            <div className="flex gap-2">
              <Btn onClick={postTest} disabled={posting} variant="primary">{posting ? 'Postando...' : 'Criar post de teste'}</Btn>
              <Btn onClick={loadReviews} disabled={loading} variant="secondary">{loading ? 'Carregando...' : 'Ver avaliações'}</Btn>
            </div>
            {reviews.length > 0 && (
              <div className="space-y-3 mt-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Avaliações recentes</p>
                {reviews.slice(0, 5).map((r, i) => (
                  <div key={r.reviewId ?? i} className="bg-neutral-50 rounded-lg p-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-900">{r.reviewer?.displayName ?? 'Anônimo'}</span>
                      <span className="text-xs text-yellow-500">{'★'.repeat(Number(r.starRating?.replace('FIVE', '5').replace('FOUR', '4').replace('THREE', '3').replace('TWO', '2').replace('ONE', '1')) || 0)}</span>
                    </div>
                    <p className="text-xs text-neutral-600 mb-2">{r.comment?.text ?? ''}</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText[r.reviewId ?? ''] ?? ''}
                        onChange={e => setReplyText(p => ({ ...p, [r.reviewId ?? '']: e.target.value }))}
                        placeholder="Responder avaliação..."
                        className="flex-1 text-xs border border-neutral-200 rounded px-2 py-1"
                      />
                      <Btn onClick={() => sendReply(r.reviewId ?? '')} variant="primary">Enviar</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </Card>
  )
}

// ─── Aba: Search Console ──────────────────────────────────────────────────────

function SearchConsoleCard({ connected }: { connected: boolean }) {
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null)
  const [sitemaps, setSitemaps] = useState<unknown[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)

  async function loadAnalytics() {
    setLoading(true)
    try { const r = await adminApi.google.searchAnalytics(); setAnalytics(r.data) }
    catch { /* pode não ter dados ainda */ }
    finally { setLoading(false) }
  }

  async function loadSitemaps() {
    try { const r = await adminApi.google.sitemaps(); setSitemaps(r.data) }
    catch {}
  }

  async function submitSitemap() {
    setSubmitting(true)
    try { await adminApi.google.submitSitemap() }
    finally { setSubmitting(false); await loadSitemaps() }
  }

  useEffect(() => {
    if (!connected) return
    loadAnalytics()
    loadSitemaps()
  }, [connected])

  if (!connected) return <Card title="Search Console" icon="🔍"><p className="text-sm text-neutral-400">Conecte o Google OAuth primeiro.</p></Card>

  return (
    <Card title="Search Console" icon="🔍">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Btn onClick={submitSitemap} disabled={submitting} variant="primary">{submitting ? 'Submetendo...' : 'Submeter sitemap'}</Btn>
          <Btn onClick={loadAnalytics} disabled={loading} variant="secondary">{loading ? '...' : 'Atualizar'}</Btn>
        </div>

        {sitemaps.length > 0 && (
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Sitemaps indexados</p>
            {(sitemaps as { path?: string; isPending?: boolean; isSubmitted?: boolean }[]).map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-neutral-700">
                <Badge ok={!s.isPending} label={s.isPending ? 'Pendente' : 'Indexado'} />
                <span>{s.path}</span>
              </div>
            ))}
          </div>
        )}

        {analytics && (
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Últimos 28 dias</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Cliques', value: analytics.totals.clicks },
                { label: 'Impressões', value: analytics.totals.impressions },
                { label: 'CTR', value: `${analytics.totals.ctr}%` },
                { label: 'Posição', value: analytics.totals.position },
              ].map(m => (
                <div key={m.label} className="bg-neutral-50 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-neutral-900">{m.value}</p>
                  <p className="text-xs text-neutral-500">{m.label}</p>
                </div>
              ))}
            </div>
            {analytics.topQueries.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">Top 5 queries</p>
                <div className="space-y-1">
                  {analytics.topQueries.map(q => (
                    <div key={q.query} className="flex justify-between text-xs">
                      <span className="text-neutral-700 truncate max-w-[180px]">{q.query}</span>
                      <span className="text-neutral-500">{q.clicks} cliques · pos. {q.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Aba: Sheets + Gmail (conta de serviço) ───────────────────────────────────

function ServiceAccountCards({ status, linhas, onTestSheets, onTestGmail, testing }: {
  status: AllStatus | null
  linhas: string[][]
  onTestSheets: () => void
  onTestGmail: () => void
  testing: Record<string, boolean>
}) {
  const HEADERS = ['Data', 'Nome', 'Telefone', 'Email', 'Origem', 'Interesse', 'Bairro', 'Preço Min', 'Preço Max', 'Score', 'Status', 'UTM']

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Google Sheets — Leads" icon="📊">
        <div className="flex items-center justify-between mb-3">
          <Badge ok={status?.sheets.ok ?? false} />
          <Btn onClick={onTestSheets} disabled={!!testing['sheets']} variant="secondary">
            {testing['sheets'] ? 'Testando...' : 'Testar'}
          </Btn>
        </div>
        {status?.sheets.url && (
          <a href={status.sheets.url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline block mb-3">
            Abrir planilha ↗
          </a>
        )}
        {status?.sheets.error && <p className="text-xs text-red-600 mb-3">{status.sheets.error}</p>}
        {linhas.length > 0 && (
          <div className="overflow-x-auto">
            <p className="text-xs font-medium text-neutral-500 mb-1">Últimos leads</p>
            <table className="w-full text-xs">
              <thead><tr>{HEADERS.slice(0, 5).map(h => <th key={h} className="text-left text-neutral-400 py-1 pr-2 font-normal">{h}</th>)}</tr></thead>
              <tbody>
                {linhas.map((row, i) => (
                  <tr key={i} className="border-t border-neutral-50">
                    {row.slice(0, 5).map((cell, j) => <td key={j} className="py-1 pr-2 text-neutral-700 whitespace-nowrap">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Gmail / SMTP" icon="📧">
        <div className="flex items-center justify-between mb-3">
          <Badge ok={status?.gmail.ok ?? false} />
          <Btn onClick={onTestGmail} disabled={!!testing['gmail']} variant="secondary">
            {testing['gmail'] ? 'Testando...' : 'Testar'}
          </Btn>
        </div>
        {status?.gmail.error && <p className="text-xs text-red-600">{status.gmail.error}</p>}
        <div className="mt-2 text-xs text-neutral-500 space-y-1">
          <p>Envia alertas para <strong>imovimobiliariace@gmail.com</strong></p>
          <p>Ativado para leads com score ≥ 50</p>
        </div>
      </Card>

      <Card title="Google Analytics 4" icon="📈">
        <div className="flex items-center justify-between mb-3">
          <Badge ok={status?.analytics.ok ?? false} />
        </div>
        {status?.analytics.error && <p className="text-xs text-red-600">{status.analytics.error}</p>}
        <div className="mt-2 text-xs text-neutral-500">
          <p>Envia evento <code>generate_lead</code> server-side a cada novo lead.</p>
        </div>
      </Card>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

type Tab = 'oauth' | 'servicos'

export default function IntegracoesPage() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>('oauth')
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus | null>(null)
  const [serviceStatus, setServiceStatus] = useState<AllStatus | null>(null)
  const [sheetsLinhas, setSheetsLinhas] = useState<string[][]>([])
  const [connecting, setConnecting] = useState(false)
  const [testing, setTesting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (searchParams.get('connected') === 'true') setTab('oauth')
    if (searchParams.get('error')) setTab('oauth')
  }, [searchParams])

  const loadOAuth = useCallback(async () => {
    try { const r = await adminApi.google.status(); setOauthStatus(r.data) } catch {}
  }, [])

  const loadServices = useCallback(async () => {
    try { const r = await adminApi.integracoes.status(); setServiceStatus(r.data) } catch {}
    try { const r = await adminApi.integracoes.sheetsLinhas(); setSheetsLinhas(r.data) } catch {}
  }, [])

  useEffect(() => { loadOAuth(); loadServices() }, [loadOAuth, loadServices])

  async function handleConnect() {
    setConnecting(true)
    try {
      const r = await adminApi.google.authUrl()
      window.location.href = r.url
    } catch { setConnecting(false) }
  }

  async function handleDisconnect() {
    await adminApi.google.disconnect()
    await loadOAuth()
  }

  async function handleTest(service: string) {
    setTesting(t => ({ ...t, [service]: true }))
    await loadServices()
    setTesting(t => ({ ...t, [service]: false }))
  }

  const connectedToOAuth = oauthStatus?.connected ?? false
  const connectionAlert = searchParams.get('connected') === 'true'
    ? '✅ Google conectado com sucesso!'
    : searchParams.get('error')
    ? '❌ Falha ao conectar. Tente novamente.'
    : null

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Integrações Google</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gerencie conexões com serviços Google.</p>
        </div>
      </div>

      {connectionAlert && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${connectionAlert.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {connectionAlert}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-100 rounded-lg p-1 w-fit">
        {([['oauth', '🔐 Google OAuth'], ['servicos', '⚙️ Serviços']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'oauth' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GoogleOAuthCard
            oauthStatus={oauthStatus}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            connecting={connecting}
          />
          <GoogleBusinessCard connected={connectedToOAuth} />
          <div className="md:col-span-2">
            <SearchConsoleCard connected={connectedToOAuth} />
          </div>
        </div>
      )}

      {tab === 'servicos' && (
        <ServiceAccountCards
          status={serviceStatus}
          linhas={sheetsLinhas}
          onTestSheets={() => handleTest('sheets')}
          onTestGmail={() => handleTest('gmail')}
          testing={testing}
        />
      )}

      <div className="mt-6 p-4 bg-neutral-50 rounded-xl text-xs text-neutral-500 space-y-1">
        <p><strong>OAuth (Meu Negócio + Search Console):</strong> Requer GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env da API.</p>
        <p><strong>Sheets + Gmail + GA4:</strong> Funcionam via conta de serviço/SMTP — sem OAuth necessário.</p>
        <p><strong>Redirect URI cadastrado no Google Cloud:</strong> <code>https://api.somar.ia.br/google/callback</code></p>
      </div>
    </div>
  )
}
