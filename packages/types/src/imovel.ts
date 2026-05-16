export type TipoImovel = 'APARTAMENTO' | 'CASA' | 'TERRENO' | 'COBERTURA' | 'COMERCIAL' | 'KITNET'
export type ModalidadeImovel = 'VENDA' | 'LOCACAO' | 'LANCAMENTO'
export type StatusImovel = 'DISPONIVEL' | 'VENDIDO' | 'ALUGADO' | 'RESERVADO' | 'INATIVO'

export interface FotoImovel {
  url: string
  legenda?: string
  ordem: number
  tipo: 'capa' | 'interior' | 'fachada' | 'planta'
}

export interface RankingInfo {
  score: number
  classificacao: 'Excelente Oportunidade' | 'Boa Oportunidade' | 'Preço Justo' | 'Acima da Média' | 'Alto Padrão'
  aviso: string
}

export interface ImovelListItem {
  id: string
  slug: string
  titulo: string
  tipo: TipoImovel
  modalidade: ModalidadeImovel
  status: StatusImovel
  preco: number
  areaTotal: number
  quartos: number
  banheiros: number
  vagas: number
  aceitaFinanciamento: boolean
  aceitaFgts: boolean
  elegivelMcmv: boolean
  novo: boolean
  destaque: boolean
  oportunidade: boolean
  rankingScore: number | null
  fotos: FotoImovel[]
  bairro: { nome: string; slug: string }
  cidade: { nome: string; slug: string }
  createdAt: string
}

export interface ImovelDetalhe extends ImovelListItem {
  descricao: string
  suites: number
  areaPrivativa: number | null
  precoCondominio: number | null
  precoIptu: number | null
  andarPavimento: number | null
  totalAndares: number | null
  anoConstrucao: number | null
  aceitaConsorcio: boolean
  endereco: string
  numero: string
  complemento: string | null
  cep: string
  latitude: number | null
  longitude: number | null
  construtoraNome: string | null
  diferenciais: string[]
  videoUrl: string | null
  tourVirtualUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  publicadoAt: string | null
}
