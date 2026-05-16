import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js'

export default async function bairrosRoutes(fastify: FastifyInstance) {
  // GET /bairros
  fastify.get('/', async (request, reply) => {
    const query = z.object({
      cidadeSlug: z.string().optional(),
      perfil: z.enum(['POPULAR', 'MEDIO', 'ALTO_PADRAO', 'LUXO']).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(request.query)

    const { skip, take, page, limit } = parsePagination({ page: query.page, limit: query.limit })
    const where: Record<string, unknown> = { ativo: true }
    if (query.cidadeSlug) where['cidade'] = { slug: query.cidadeSlug }
    if (query.perfil) where['perfil'] = query.perfil

    const [data, total] = await Promise.all([
      fastify.prisma.bairro.findMany({
        where,
        skip,
        take,
        include: {
          cidade: { select: { nome: true, slug: true } },
          _count: { select: { imoveis: { where: { status: 'DISPONIVEL' } } } },
        },
      }),
      fastify.prisma.bairro.count({ where }),
    ])

    return reply.send(buildPaginatedResponse(data, total, page, limit))
  })

  // GET /bairros/:slug
  fastify.get('/:slug', async (request, reply) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params)

    const bairro = await fastify.prisma.bairro.findUnique({
      where: { slug },
      include: { cidade: true },
    })

    if (!bairro) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Bairro não encontrado' })

    const [totalImoveis, imoveisDestaque, distribuicao] = await Promise.all([
      fastify.prisma.imovel.count({ where: { bairroId: bairro.id, status: 'DISPONIVEL' } }),
      fastify.prisma.imovel.findMany({
        where: { bairroId: bairro.id, destaque: true, status: 'DISPONIVEL' },
        take: 3,
        orderBy: { rankingScore: 'desc' },
        include: { bairro: { select: { nome: true, slug: true } }, cidade: { select: { nome: true, slug: true } } },
      }),
      fastify.prisma.imovel.groupBy({
        by: ['tipo'],
        where: { bairroId: bairro.id, status: 'DISPONIVEL' },
        _count: true,
      }),
    ])

    const distribuicaoPorTipo = Object.fromEntries(distribuicao.map((d: { tipo: string; _count: number }) => [d.tipo, d._count]))

    return reply.send({
      data: bairro,
      stats: { totalImoveis, imoveisDestaque, distribuicaoPorTipo },
    })
  })

  // GET /bairros/:slug/imoveis
  fastify.get('/:slug/imoveis', async (request, reply) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params)
    const query = z.object({
      tipo: z.string().optional(),
      quartos: z.coerce.number().optional(),
      precoMin: z.coerce.number().optional(),
      precoMax: z.coerce.number().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(request.query)

    const bairro = await fastify.prisma.bairro.findUnique({ where: { slug }, select: { id: true } })
    if (!bairro) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Bairro não encontrado' })

    const { skip, take, page, limit } = parsePagination({ page: query.page, limit: query.limit })
    const where: Record<string, unknown> = { bairroId: bairro.id, status: 'DISPONIVEL' }
    if (query.tipo) where['tipo'] = query.tipo
    if (query.quartos != null) where['quartos'] = { gte: query.quartos }
    if (query.precoMin != null || query.precoMax != null) {
      where['preco'] = {
        ...(query.precoMin != null ? { gte: query.precoMin } : {}),
        ...(query.precoMax != null ? { lte: query.precoMax } : {}),
      }
    }

    const [data, total] = await Promise.all([
      fastify.prisma.imovel.findMany({
        where,
        skip,
        take,
        orderBy: { rankingScore: 'desc' },
        include: {
          bairro: { select: { nome: true, slug: true } },
          cidade: { select: { nome: true, slug: true } },
        },
      }),
      fastify.prisma.imovel.count({ where }),
    ])

    return reply.send(buildPaginatedResponse(data, total, page, limit))
  })

  // GET /bairros/:slug/estatisticas
  fastify.get('/:slug/estatisticas', async (request, reply) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params)

    const bairro = await fastify.prisma.bairro.findUnique({
      where: { slug },
      select: {
        id: true, nome: true, precoM2MedioVenda: true, precoM2MedioLocacao: true,
        valorizacao12meses: true, pontuacaoInfraestrutura: true, perfil: true,
      },
    })

    if (!bairro) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Bairro não encontrado' })

    const [totalImoveis, distribuicao] = await Promise.all([
      fastify.prisma.imovel.count({ where: { bairroId: bairro.id, status: 'DISPONIVEL' } }),
      fastify.prisma.imovel.groupBy({
        by: ['tipo'],
        where: { bairroId: bairro.id, status: 'DISPONIVEL' },
        _count: true,
        _avg: { preco: true },
      }),
    ])

    return reply.send({
      data: {
        ...bairro,
        totalImoveis,
        distribuicaoPorTipo: distribuicao.map((d: { tipo: string; _count: number; _avg: { preco: unknown } }) => ({
          tipo: d.tipo,
          count: d._count,
          precoMedio: d._avg.preco,
        })),
      },
    })
  })
}
