import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { updateLeadStatusSchema, updateLeadObservacoesSchema } from '../../schemas/lead.schema.js'
import { parsePagination, buildPaginatedResponse } from '../../utils/pagination.js'

export default async function adminLeadsRoutes(fastify: FastifyInstance) {
  fastify.get('/leads', async (request, reply) => {
    const query = z.object({
      origem: z.string().optional(),
      statusCrm: z.string().optional(),
      scoreMin: z.coerce.number().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }).parse(request.query)

    const { skip, take, page, limit } = parsePagination({ page: query.page, limit: query.limit })
    const where: Record<string, unknown> = {}
    if (query.origem) where['origem'] = query.origem
    if (query.statusCrm) where['statusCrm'] = query.statusCrm
    if (query.scoreMin != null) where['score'] = { gte: query.scoreMin }

    const [data, total] = await Promise.all([
      fastify.prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          imovel: { select: { titulo: true, slug: true } },
          bairroInteresse: { select: { nome: true, slug: true } },
        },
      }),
      fastify.prisma.lead.count({ where }),
    ])

    return reply.send(buildPaginatedResponse(data, total, page, limit))
  })

  fastify.patch('/leads/:id/status', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const body = updateLeadStatusSchema.parse(request.body)

    const lead = await fastify.prisma.lead.update({
      where: { id },
      data: {
        statusCrm: body.statusCrm,
        ...(body.statusCrm === 'CONTATADO' ? { contatadoAt: new Date() } : {}),
      },
    })

    return reply.send({ success: true, data: lead })
  })

  fastify.patch('/leads/:id/observacoes', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const body = updateLeadObservacoesSchema.parse(request.body)

    const lead = await fastify.prisma.lead.update({ where: { id }, data: { observacoes: body.observacoes } })
    return reply.send({ success: true, data: lead })
  })
}
