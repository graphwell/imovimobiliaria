export type OrigemLead =
  | 'FORMULARIO_IMOVEL'
  | 'FORMULARIO_BAIRRO'
  | 'WHATSAPP'
  | 'IA_CHAT'
  | 'SIMULADOR'
  | 'LANDING_PAGE'
  | 'ORGANICO'

export type InteresseTipo = 'COMPRA' | 'LOCACAO' | 'INVESTIMENTO' | 'LANCAMENTO' | 'FINANCIAMENTO'
export type StatusCrm = 'NOVO' | 'CONTATADO' | 'QUALIFICADO' | 'PROPOSTA' | 'CONVERTIDO' | 'PERDIDO'

export interface ComportamentoNavegacao {
  bairrosVisitados: string[]
  imoveisVisitados: { slug: string; titulo: string; preco: number; bairro: string }[]
  tiposBuscados: string[]
  faixaPrecoExplorada: { min: number; max: number } | null
  quartosExplorados: number[]
  tempoSessaoSegundos: number
  paginasVisitadas: number
}

export interface Lead {
  id: string
  nome: string
  telefone: string
  email: string | null
  origem: OrigemLead
  interesseTipo: InteresseTipo
  imovelId: string | null
  empreendimentoId: string | null
  bairroInteresseId: string | null
  cidadeId: string | null
  faixaPrecoMin: number | null
  faixaPrecoMax: number | null
  quartosDesejados: number | null
  score: number
  statusCrm: StatusCrm
  observacoes: string | null
  comportamentoJson: ComportamentoNavegacao | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  createdAt: string
  updatedAt: string
  contatadoAt: string | null
}

export interface CreateLeadInput {
  nome: string
  telefone: string
  email?: string
  origem: OrigemLead
  interesseTipo: InteresseTipo
  imovelId?: string
  empreendimentoId?: string
  bairroInteresseId?: string
  faixaPrecoMin?: number
  faixaPrecoMax?: number
  quartosDesejados?: number
  comportamentoJson?: ComportamentoNavegacao
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
}
