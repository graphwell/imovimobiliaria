const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

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
    throw new Error(err.message ?? `HTTP ${res.status}`)
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

  bairros: () => request<{ data: { id: string; nome: string; slug: string; cidadeId: string; cidade: { id: string; nome: string } }[] }>('/bairros'),

  integracoes: {
    status: () => request<{ data: { sheets: { ok: boolean; spreadsheetId?: string; url?: string; error?: string }; gmail: { ok: boolean; error?: string }; analytics: { ok: boolean; error?: string } } }>('/admin/integracoes/status'),
    sheetsLinhas: () => request<{ data: string[][] }>('/admin/integracoes/sheets/linhas'),
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
