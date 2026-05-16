export type PerfilBairro = 'POPULAR' | 'MEDIO' | 'ALTO_PADRAO' | 'LUXO'

export interface InfraestruturaCategoria {
  nome: string
  itens: string[]
}

export interface InfraestruturaJson {
  escolas: string[]
  hospitais: string[]
  shoppings: string[]
  transporte: string[]
}

export interface BairroListItem {
  id: string
  nome: string
  slug: string
  regiao: string | null
  perfil: PerfilBairro
  precoM2MedioVenda: number | null
  precoM2MedioLocacao: number | null
  valorizacao12meses: number | null
  pontuacaoInfraestrutura: number | null
  imagemDestaqueUrl: string | null
  cidade: { nome: string; slug: string }
  totalImoveis?: number
}

export interface BairroDetalhe extends BairroListItem {
  descricaoSeo: string
  infraestrutura: InfraestruturaJson
  metaTitle: string | null
  metaDescription: string | null
}
