const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

const UPLOAD_EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('imov_admin_token')
}

export function setToken(token: string) {
  localStorage.setItem('imov_admin_token', token)
}

export function clearToken() {
  localStorage.removeItem('imov_admin_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/admin/login'
    throw new Error('Não autenticado')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message ?? err.error ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export const adminApi = {
  login: (email: string, senha: string) =>
    request<{ success: boolean; token: string; data: { id: string; nome: string; email: string; role: string } }>(
      '/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }
    ),

  me: () => request<{ data: { id: string; nome: string; email: string; role: string } }>('/auth/me'),

  logout: () => request('/auth/logout', { method: 'POST' }),

  dashboard: () => request<{ data: DashboardMetricas }>('/admin/dashboard/metricas'),

  imoveis: {
    list: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : ''
      return request<{ data: AdminImovel[]; total: number; page: number; totalPages: number }>(`/admin/imoveis${q}`)
    },
    get: (id: string) =>
      request<{ success: boolean; data: AdminImovelDetalhe }>(`/admin/imoveis/${id}`),
    create: (body: Record<string, unknown>) =>
      request<{ success: boolean; data: AdminImovel }>('/admin/imoveis', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      request<{ success: boolean; data: AdminImovel }>(`/admin/imoveis/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    updateStatus: (id: string, status: string) =>
      request(`/admin/imoveis/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    toggleDestaque: (id: string, destaque: boolean) =>
      request(`/admin/imoveis/${id}/status`, { method: 'PATCH', body: JSON.stringify({ destaque }) }),
    delete: (id: string) =>
      request(`/admin/imoveis/${id}`, { method: 'DELETE' }),
  },

  leads: {
    list: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : ''
      return request<{ data: AdminLead[]; total: number; page: number; totalPages: number }>(`/admin/leads${q}`)
    },
    updateStatus: (id: string, statusCrm: string) =>
      request(`/admin/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ statusCrm }) }),
    updateObs: (id: string, observacoes: string) =>
      request(`/admin/leads/${id}/observacoes`, { method: 'PATCH', body: JSON.stringify({ observacoes }) }),
  },

  // Upload direto do browser para o Supabase Storage via signed URL — a API
  // só gera a URL assinada (POST /admin/upload/signed-url); o arquivo em si
  // nunca passa por ela. Necessário porque a Vercel Serverless Function tem
  // limite de ~4.5MB de corpo de request, incompatível com upload de fotos/vídeo.
  uploadImagem: async (file: File): Promise<{ success: boolean; url: string }> => {
    const ext = UPLOAD_EXT_MAP[file.type] ?? 'jpg'
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`

    const { uploadUrl, publicUrl, apikey } = await request<{
      success: boolean
      uploadUrl: string
      publicUrl: string
      apikey: string
    }>('/admin/upload/signed-url', {
      method: 'POST',
      body: JSON.stringify({ bucket: 'imoveis', path, contentType: file.type }),
    })

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type, apikey },
      body: file,
    })

    if (!uploadRes.ok) {
      throw new Error('Erro ao enviar arquivo para o storage')
    }

    return { success: true, url: publicUrl }
  },

  bairros: () => request<{ data: { id: string; nome: string; slug: string; cidadeId: string; cidade: { id: string; nome: string } }[] }>('/bairros'),

  integracoes: {
    status: () => request<{ data: { sheets: { ok: boolean; spreadsheetId?: string; url?: string; error?: string }; gmail: { ok: boolean; error?: string }; analytics: { ok: boolean; error?: string } } }>('/admin/integracoes/status'),
    sheetsLinhas: () => request<{ data: string[][] }>('/admin/integracoes/sheets/linhas'),
  },

  google: {
    authUrl: () => request<{ url: string }>('/admin/google/auth-url'),
    status: () => request<{ data: { connected: boolean; email?: string; expiresAt?: string; scopes?: string[]; expired?: boolean } }>('/admin/google/status'),
    disconnect: () => request('/admin/google/disconnect', { method: 'DELETE' }),

    businessAccounts: () => request<{ data: { name: string; accountName: string; type: string }[] }>('/admin/google/business/accounts'),
    businessLocations: (accountName: string) =>
      request<{ data: { name: string; title: string }[] }>(`/admin/google/business/locations?accountName=${encodeURIComponent(accountName)}`),
    businessPost: (locationName: string, summary: string, callToActionType?: string) =>
      request('/admin/google/business/post', {
        method: 'POST',
        body: JSON.stringify({ locationName, summary, callToActionType, callToActionUrl: window.location.origin }),
      }),
    businessReviews: (locationName: string) =>
      request<{ data: unknown[] }>(`/admin/google/business/reviews?locationName=${encodeURIComponent(locationName)}`),
    reviewReply: (locationName: string, reviewId: string, reply: string) =>
      request('/admin/google/business/reviews/reply', {
        method: 'POST',
        body: JSON.stringify({ locationName, reviewId, reply }),
      }),

    sitemaps: () => request<{ data: unknown[] }>('/admin/google/search-console/sitemaps'),
    submitSitemap: () => request('/admin/google/search-console/submit-sitemap', { method: 'POST', body: JSON.stringify({}) }),
    searchAnalytics: (startDate?: string, endDate?: string) => {
      const q = new URLSearchParams()
      if (startDate) q.set('startDate', startDate)
      if (endDate) q.set('endDate', endDate)
      const qs = q.toString() ? `?${q.toString()}` : ''
      return request<{ data: { totals: { clicks: number; impressions: number; ctr: number; position: number }; topQueries: { query: string; clicks: number; impressions: number; position: number }[] } }>(`/admin/google/search-console/analytics${qs}`)
    },
  },
}

export interface DashboardMetricas {
  totalImoveis: number
  imoveisAtivos: number
  leadsHoje: number
  leadsSemana: number
  taxaQualificacao: number
  leadsPorOrigem: { origem: string; count: number }[]
  leadsPorStatus: { status: string; count: number }[]
  ultimosLeads: AdminLead[]
}

export interface AdminImovel {
  id: string
  slug: string
  titulo: string
  tipo: string
  modalidade: string
  status: string
  preco: string
  areaTotal: string
  quartos: number
  banheiros: number
  vagas: number
  destaque: boolean
  oportunidade: boolean
  novo: boolean
  bairro: { nome: string; slug: string }
  cidade: { nome: string; slug: string }
  createdAt: string
}

export interface AdminImovelDetalhe {
  id: string; slug: string; titulo: string; descricao: string
  tipo: string; modalidade: string; status: string
  preco: string; precoCondominio?: string; precoIptu?: string
  areaTotal: string; areaPrivativa?: string
  quartos: number; suites: number; banheiros: number; vagas: number
  andarPavimento?: number; totalAndares?: number; anoConstrucao?: number
  aceitaFinanciamento: boolean; aceitaFgts: boolean; aceitaConsorcio: boolean; elegivelMcmv: boolean
  novo: boolean; destaque: boolean; oportunidade: boolean
  endereco: string; numero: string; complemento?: string; cep: string
  bairroId: string; cidadeId: string
  construtoraNome?: string; latitude?: string; longitude?: string
  diferenciais: string[]
  fotos: { url: string; legenda?: string; ordem: number; tipo: string }[]
  metaTitle?: string; metaDescription?: string
  bairro: { id: string; nome: string; slug: string; cidadeId: string }
  cidade: { id: string; nome: string; slug: string }
}

export interface AdminLead {
  id: string
  nome: string
  telefone: string
  email?: string
  origem: string
  score: number
  statusCrm: string
  observacoes?: string
  createdAt: string
  imovel?: { titulo: string; slug: string }
  bairroInteresse?: { nome: string }
}
