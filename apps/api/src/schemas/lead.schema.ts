import { z } from 'zod'

const comportamentoSchema = z.object({
  bairrosVisitados: z.array(z.string()).default([]),
  imoveisVisitados: z.array(z.object({
    slug: z.string(),
    titulo: z.string(),
    preco: z.number(),
    bairro: z.string(),
  })).default([]),
  tiposBuscados: z.array(z.string()).default([]),
  faixaPrecoExplorada: z.object({ min: z.number(), max: z.number() }).nullable().default(null),
  quartosExplorados: z.array(z.number()).default([]),
  tempoSessaoSegundos: z.number().default(0),
  paginasVisitadas: z.number().default(0),
})

export const createLeadSchema = z.object({
  nome: z.string().min(2).max(100),
  telefone: z.string().min(10).max(20),
  email: z.string().email().optional(),
  origem: z.enum([
    'FORMULARIO_IMOVEL',
    'FORMULARIO_BAIRRO',
    'WHATSAPP',
    'IA_CHAT',
    'SIMULADOR',
    'LANDING_PAGE',
    'ORGANICO',
  ]),
  interesseTipo: z.enum(['COMPRA', 'LOCACAO', 'INVESTIMENTO', 'LANCAMENTO', 'FINANCIAMENTO']),
  imovelId: z.string().uuid().optional(),
  empreendimentoId: z.string().uuid().optional(),
  bairroInteresseId: z.string().uuid().optional(),
  cidadeId: z.string().uuid().optional(),
  faixaPrecoMin: z.number().optional(),
  faixaPrecoMax: z.number().optional(),
  quartosDesejados: z.number().int().optional(),
  comportamentoJson: comportamentoSchema.optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
})

export const updateLeadStatusSchema = z.object({
  statusCrm: z.enum(['NOVO', 'CONTATADO', 'QUALIFICADO', 'PROPOSTA', 'CONVERTIDO', 'PERDIDO']),
})

export const updateLeadObservacoesSchema = z.object({
  observacoes: z.string(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
