import type { CreateLeadInput } from '@imov/types'

export function calcularScoreLead(input: CreateLeadInput): number {
  let score = 0

  if (input.telefone?.trim()) score += 25
  if (input.email?.trim()) score += 20
  if (input.imovelId || input.empreendimentoId) score += 15
  if (input.bairroInteresseId) score += 15
  if (input.faixaPrecoMin != null || input.faixaPrecoMax != null) score += 10

  const comportamento = input.comportamentoJson
  if (comportamento && comportamento.imoveisVisitados.length >= 3) score += 10

  if (input.utmSource || input.utmMedium || input.utmCampaign) score += 5

  return Math.min(100, score)
}
