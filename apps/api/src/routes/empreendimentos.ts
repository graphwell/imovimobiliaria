import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js'

export default async function empreendimentosRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const query = z.object({
      cidadeSlug: z.string().optional(),
      bairroSlug: z.string().optional(),
      constutoraSlug: z.string().optional(),
      status: z.enum(['LANCAMENTO', 'EM_OBRAS', 'PRONTO', 'ENTREGUE']).optional(),
      elegivelMcmv: z.coerce.boolean().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(12),
    }).parse(request.query)

    const { skip, take, page, limit } = parsePagination({ page: query.page, limit: query.limit })
    const where: Record<string, unknown> = {}
    if (query.status) where['status'] = query.status
    if (query.elegivelMcmv != null) where['elegivelMcmv'] = query.elegivelMcmv
    if (query.constutoraSlug) where['constutoraSlug'] = query.constutoraSlug
    if (query.bairroSlug) where['bairro'] = { slug: query.bairroSlug }
    if (query.cidadeSlug) where['cidade'] = { slug: query.cidadeSlug }

    const [data, total] = await Promise.all([
      fastify.prisma.empreendimento.findMany({
        where,
        skip,
        take,
        include: {
          bairro: { select: { nome: true, slug: true } },
          cidade: { select: { nome: true, slug: true } },
        },
      }),
      fastify.prisma.empreendimento.count({ where }),
    ])

    return reply.send(buildPaginatedResponse(data, total, page, limit))
  })

  fastify.get('/:slug', async (request, reply) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params)

    const empreendimento = await fastify.prisma.empreendimento.findUnique({
      where: { slug },
      include: {
        bairro: true,
        cidade: true,
        imoveis: {
          where: { status: 'DISPONIVEL' },
          take: 10,
          include: {
            bairro: { select: { nome: true, slug: true } },
            cidade: { select: { nome: true, slug: true } },
          },
        },
      },
    })

    if (!empreendimento) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Empreendimento não encontrado' })

    return reply.send({ data: empreendimento })
  })
}
