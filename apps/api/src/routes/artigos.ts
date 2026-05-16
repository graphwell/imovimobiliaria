import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js'

export default async function artigosRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const query = z.object({
      categoria: z.enum(['FINANCIAMENTO', 'CONSORCIO', 'DOCUMENTACAO', 'MCMV', 'INVESTIMENTO', 'MERCADO', 'DICAS']).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(12),
    }).parse(request.query)

    const { skip, take, page, limit } = parsePagination({ page: query.page, limit: query.limit })
    const where: Record<string, unknown> = { publicado: true }
    if (query.categoria) where['categoria'] = query.categoria

    const [data, total] = await Promise.all([
      fastify.prisma.artigo.findMany({
        where,
        orderBy: { publicadoAt: 'desc' },
        skip,
        take,
        select: {
          id: true, slug: true, titulo: true, subtitulo: true, categoria: true,
          tags: true, autorNome: true, imagemCapaUrl: true, tempoLeituraMinutos: true,
          publicadoAt: true, metaTitle: true, metaDescription: true,
        },
      }),
      fastify.prisma.artigo.count({ where }),
    ])

    return reply.send(buildPaginatedResponse(data, total, page, limit))
  })

  fastify.get('/:slug', async (request, reply) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params)

    const artigo = await fastify.prisma.artigo.findUnique({ where: { slug, publicado: true } })
    if (!artigo) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Artigo não encontrado' })

    const relacionados = await fastify.prisma.artigo.findMany({
      where: { categoria: artigo.categoria, publicado: true, id: { not: artigo.id } },
      take: 3,
      orderBy: { publicadoAt: 'desc' },
      select: { id: true, slug: true, titulo: true, categoria: true, imagemCapaUrl: true, tempoLeituraMinutos: true },
    })

    return reply.send({ data: artigo, relacionados })
  })
}
