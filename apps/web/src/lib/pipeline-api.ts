// DESCONTINUADO: este cliente falava com um serviço externo
// (pipeline-api.somar.ia.br) que rodava na VPS antiga e não está neste
// monorepo nem em nenhum repositório acessível. A VPS foi desativada, então
// essa URL está morta — não faça fetch para ela.
// A tela /admin/importacoes foi desativada (ver page.tsx) para não tentar
// chamar este cliente. TODO: repensar esse pipeline do zero (Google Drive →
// ingestão de fotos) como Edge Function/serviço separado antes de reativar.
const PIPELINE_URL = process.env.NEXT_PUBLIC_PIPELINE_URL ?? 'https://pipeline-api.somar.ia.br'
const TOKEN_KEY = 'pipeline_token'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

async function ensureAuth(): Promise<string> {
  const token = getToken()
  if (token) return token

  const res = await fetch(`${PIPELINE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@imov.somar.ia.br', password: 'imov@admin2024' }),
  })

  if (!res.ok) throw new Error('Falha ao autenticar na Pipeline API')
  const data = await res.json()
  setToken(data.accessToken)
  return data.accessToken
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = await ensureAuth()
  const res = await fetch(`${PIPELINE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (res.status === 401 && retry) {
    localStorage.removeItem(TOKEN_KEY)
    return request(path, options, false)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export interface PipelineImportacao {
  id: string
  status: 'AGUARDANDO' | 'VERIFICANDO' | 'BAIXANDO' | 'CLASSIFICANDO' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO'
  sourceType: 'GOOGLE_DRIVE' | 'HTTP_URL' | 'ZIP_UPLOAD' | 'DROPBOX' | string
  sourceUrl: string | null
  progresso: number
  etapaAtual: string | null
  totalArquivos: number
  processados: number
  erros: number
  createdAt: string
  completedAt: string | null
}

export const pipelineApi = {
  importacoes: {
    list: (page = 1) =>
      request<{ data: PipelineImportacao[]; total: number; totalPages: number }>(
        `/api/importacoes?page=${page}&limit=20`
      ),
    get: (id: string) =>
      request<PipelineImportacao>(`/api/importacoes/${id}`),
    create: (sourceUrl: string, sourceType: string) =>
      request<{ id: string; status: string; socketRoom: string }>('/api/importacoes', {
        method: 'POST',
        body: JSON.stringify({ sourceType, sourceUrl }),
      }),
    retry: (id: string) =>
      request<{ message: string }>(`/api/importacoes/${id}/retry`, { method: 'POST' }),
  },
}

export const PIPELINE_WS_URL = PIPELINE_URL.replace(/^https?/, (m) => (m === 'https' ? 'wss' : 'ws'))

export const STATUS_LABEL: Record<string, string> = {
  AGUARDANDO: 'Aguardando',
  VERIFICANDO: 'Verificando',
  BAIXANDO: 'Baixando',
  CLASSIFICANDO: 'Classificando',
  PROCESSANDO: 'Processando',
  CONCLUIDO: 'Concluído',
  ERRO: 'Erro',
}

export const STATUS_COLOR: Record<string, string> = {
  AGUARDANDO: 'bg-neutral-100 text-neutral-600',
  VERIFICANDO: 'bg-blue-100 text-blue-700',
  BAIXANDO: 'bg-blue-100 text-blue-700',
  CLASSIFICANDO: 'bg-purple-100 text-purple-700',
  PROCESSANDO: 'bg-orange-100 text-orange-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
  ERRO: 'bg-red-100 text-red-600',
}

export function isActive(status: string) {
  return ['VERIFICANDO', 'BAIXANDO', 'CLASSIFICANDO', 'PROCESSANDO'].includes(status)
}
