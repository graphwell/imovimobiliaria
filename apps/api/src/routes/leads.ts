import type { FastifyInstance } from 'fastify'
import type { Prisma } from '@prisma/client'
import { createLeadSchema } from '../schemas/lead.schema.js'
import { calcularScoreLead } from '../services/leadScoringService.js'

export default async function leadsRoutes(fastify: FastifyInstance) {
  // POST /leads — público
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
    })

    return reply.code(201).send({ success: true, data: { id: lead.id, score: lead.score } })
  })
}
