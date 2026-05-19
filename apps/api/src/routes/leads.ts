import type { FastifyInstance } from 'fastify'
import type { Prisma } from '@prisma/client'
import { createLeadSchema } from '../schemas/lead.schema.js'
import { calcularScoreLead } from '../services/leadScoringService.js'
import { appendLeadToSheet } from '../services/googleSheetsService.js'
import { enviarAlertaLead } from '../services/gmailService.js'
import { trackLeadEvent } from '../services/analyticsService.js'

export default async function leadsRoutes(fastify: FastifyInstance) {
  fastify.post('/', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const body = createLeadSchema.parse(request.body)
    const score = calcularScoreLead(body)

    const lead = await fastify.prisma.lead.create({
      data: {
        ...body,
        score,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        faixaPrecoMin: body.faixaPrecoMin,
        faixaPrecoMax: body.faixaPrecoMax,
        comportamentoJson: body.comportamentoJson !== undefined
          ? (body.comportamentoJson as unknown as Prisma.InputJsonValue)
          : undefined,
      },
      include: {
        bairroInteresse: { select: { nome: true } },
      },
    })

    // Fire-and-forget: Google integrations (não bloqueiam a resposta)
    const bairroNome = lead.bairroInteresse?.nome ?? null
    void Promise.all([
      appendLeadToSheet({
        createdAt: lead.createdAt,
        nome: lead.nome,
        telefone: lead.telefone,
        email: lead.email,
        origem: lead.origem,
        interesseTipo: lead.interesseTipo,
        bairroNome,
        faixaPrecoMin: lead.faixaPrecoMin ? Number(lead.faixaPrecoMin) : null,
        faixaPrecoMax: lead.faixaPrecoMax ? Number(lead.faixaPrecoMax) : null,
        score: lead.score,
        statusCrm: lead.statusCrm,
        utmSource: lead.utmSource,
      }),
      enviarAlertaLead({
        nome: lead.nome,
        telefone: lead.telefone,
        email: lead.email,
        origem: lead.origem,
        score: lead.score,
        bairroNome,
        interesseTipo: lead.interesseTipo,
        faixaPrecoMin: lead.faixaPrecoMin ? Number(lead.faixaPrecoMin) : null,
        faixaPrecoMax: lead.faixaPrecoMax ? Number(lead.faixaPrecoMax) : null,
        utmSource: lead.utmSource,
      }),
      trackLeadEvent({
        clientId: lead.id,
        value: lead.faixaPrecoMin ? Number(lead.faixaPrecoMin) : 0,
        origem: lead.origem,
        score: lead.score,
        bairro: bairroNome,
        utmSource: lead.utmSource,
      }),
    ]).catch(err => fastify.log.error({ err }, 'Erro nas integrações Google'))

    return reply.code(201).send({ success: true, data: { id: lead.id, score: lead.score } })
  })
}
