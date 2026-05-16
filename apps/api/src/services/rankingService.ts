import type { Imovel, Bairro } from '@prisma/client'

const RANKING_AVISO =
  'Indicadores baseados em estimativas automatizadas. Não constituem avaliação técnica oficial.'

export type RankingClassificacao =
  | 'Excelente Oportunidade'
  | 'Boa Oportunidade'
  | 'Preço Justo'
  | 'Acima da Média'
  | 'Alto Padrão'

export interface RankingResult {
  score: number
  classificacao: RankingClassificacao
  aviso: string
  breakdown: {
    precoVsMediaBairro: number
    valorizacaoBairro: number
    recencia: number
    beneficiosFinanciamento: number
    completudeAnuncio: number
    infraestruturaBairro: number
  }
}

interface ImovelComBairro extends Imovel {
  bairro: Pick<
    Bairro,
    'precoM2MedioVenda' | 'valorizacao12meses' | 'pontuacaoInfraestrutura'
  >
}

export function calcularRankingImovel(imovel: ImovelComBairro): RankingResult {
  const preco = Number(imovel.preco)
  const area = Number(imovel.areaTotal)
  const precoM2 = area > 0 ? preco / area : 0
  const precoM2MedioBairro = Number(imovel.bairro.precoM2MedioVenda ?? 0)

  // Alto Padrão: preço/m² > 15.000 independente do score
  if (precoM2 > 15000) {
    return {
      score: 0,
      classificacao: 'Alto Padrão',
      aviso: RANKING_AVISO,
      breakdown: {
        precoVsMediaBairro: 0,
        valorizacaoBairro: 0,
        recencia: 0,
        beneficiosFinanciamento: 0,
        completudeAnuncio: 0,
        infraestruturaBairro: 0,
      },
    }
  }

  // Peso 30: preço/m² vs média do bairro
  let precoVsMediaBairro = 0
  if (precoM2MedioBairro > 0 && precoM2 > 0) {
    const diff = (precoM2MedioBairro - precoM2) / precoM2MedioBairro
    precoVsMediaBairro = Math.max(0, Math.min(30, 15 + diff * 100))
  } else {
    precoVsMediaBairro = 15
  }

  // Peso 20: valorização do bairro
  const valorizacao = Number(imovel.bairro.valorizacao12meses ?? 0)
  const valorizacaoBairro = Math.min(20, (valorizacao / 10) * 20)

  // Peso 15: recência (publicado há menos de 30 dias = máximo)
  let recencia = 0
  if (imovel.publicadoAt) {
    const diasDesdePublicacao =
      (Date.now() - new Date(imovel.publicadoAt).getTime()) / (1000 * 60 * 60 * 24)
    recencia = Math.max(0, 15 - (diasDesdePublicacao / 90) * 15)
  }

  // Peso 15: aceita financiamento/FGTS/MCMV
  let beneficiosFinanciamento = 0
  if (imovel.aceitaFinanciamento) beneficiosFinanciamento += 5
  if (imovel.aceitaFgts) beneficiosFinanciamento += 5
  if (imovel.elegivelMcmv) beneficiosFinanciamento += 5

  // Peso 10: completude do anúncio
  let completudeAnuncio = 0
  const fotos = Array.isArray(imovel.fotos) ? imovel.fotos : []
  if (fotos.length > 0) completudeAnuncio += 3
  if (fotos.length >= 5) completudeAnuncio += 2
  if (imovel.descricao.length > 100) completudeAnuncio += 2
  if (imovel.areaTotal) completudeAnuncio += 1
  if (imovel.latitude && imovel.longitude) completudeAnuncio += 2

  // Peso 10: pontuação de infraestrutura do bairro
  const pontuacaoInfra = imovel.bairro.pontuacaoInfraestrutura ?? 50
  const infraestruturaBairro = (pontuacaoInfra / 100) * 10

  const score = Math.round(
    precoVsMediaBairro +
      valorizacaoBairro +
      recencia +
      beneficiosFinanciamento +
      completudeAnuncio +
      infraestruturaBairro,
  )

  const classificacao = getClassificacao(score)

  return {
    score,
    classificacao,
    aviso: RANKING_AVISO,
    breakdown: {
      precoVsMediaBairro: Math.round(precoVsMediaBairro),
      valorizacaoBairro: Math.round(valorizacaoBairro),
      recencia: Math.round(recencia),
      beneficiosFinanciamento,
      completudeAnuncio,
      infraestruturaBairro: Math.round(infraestruturaBairro),
    },
  }
}

function getClassificacao(score: number): RankingClassificacao {
  if (score >= 85) return 'Excelente Oportunidade'
  if (score >= 70) return 'Boa Oportunidade'
  if (score >= 50) return 'Preço Justo'
  return 'Acima da Média'
}
