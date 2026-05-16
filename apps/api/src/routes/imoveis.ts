import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { imovelFiltrosSchema, createImovelSchema } from '../schemas/imovel.schema.js'
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js'
import { slugify } from '../utils/slug.js'

export default async function imoveisRoutes(fastify: FastifyInstance) {
  // GET /imoveis — listagem com filtros
  fastify.get('/', {
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const query = imovelFiltrosSchema.parse(request.query)
    const { skip, take, page, limit } = parsePagination({ page: query.page, limit: query.limit })

    const where: Record<string, unknown> = { status: query.status ?? 'DISPONIVEL' }
    if (query.tipo) where['tipo'] = query.tipo
    if (query.modalidade) where['modalidade'] = query.modalidade
    if (query.aceitaFinanciamento != null) where['aceitaFinanciamento'] = query.aceitaFinanciamento
    if (query.aceitaFgts != null) where['aceitaFgts'] = query.aceitaFgts
    if (query.elegivelMcmv != null) where['elegivelMcmv'] = query.elegivelMcmv
    if (query.novo != null) where['novo'] = query.novo
    if (query.destaque != null) where['destaque'] = query.destaque
    if (query.oportunidade != null) where['oportunidade'] = query.oportunidade
    if (query.construtora) where['construtoraNome'] = { contains: query.construtora, mode: 'insensitive' }
    if (query.quartos != null) where['quartos'] = { gte: query.quartos }
    if (query.precoMin != null || query.precoMax != null) {
      where['preco'] = {
        ...(query.precoMin != null ? { gte: query.precoMin } : {}),
        ...(query.precoMax != null ? { lte: query.precoMax } : {}),
      }
    }
    if (query.bairroSlug) where['bairro'] = { slug: query.bairroSlug }
    if (query.cidadeSlug) where['cidade'] = { slug: query.cidadeSlug }

    const orderBy: Record<string, unknown> = {}
    switch (query.ordenar) {
      case 'preco_asc': orderBy['preco'] = 'asc'; break
      case 'preco_desc': orderBy['preco'] = 'desc'; break
      case 'ranking': orderBy['rankingScore'] = 'desc'; break
      default: orderBy['publicadoAt'] = 'desc'
    }

    const [data, total] = await Promise.all([
      fastify.prisma.imovel.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          bairro: { select: { nome: true, slug: true } },
          cidade: { select: { nome: true, slug: true } },
        },
      }),
      fastify.prisma.imovel.count({ where }),
    ])

    return reply.send(buildPaginatedResponse(data, total, page, limit))
  })

  // GET /imoveis/destaques
  fastify.get('/destaques', async (_request, reply) => {
    const data = await fastify.prisma.imovel.findMany({
      where: { destaque: true, status: 'DISPONIVEL' },
      orderBy: { rankingScore: 'desc' },
      take: 6,
      include: {
        bairro: { select: { nome: true, slug: true } },
        cidade: { select: { nome: true, slug: true } },
      },
    })
    return reply.send({ data })
  })

  // GET /imoveis/:slug
  fastify.get('/:slug', async (request, reply) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params)

    const imovel = await fastify.prisma.imovel.findUnique({
      where: { slug },
      include: {
        bairro: true,
        cidade: true,
        empreendimento: true,
      },
    })

    if (!imovel) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Imóvel não encontrado' })

    const preco = Number(imovel.preco)
    const similares = await fastify.prisma.imovel.findMany({
      where: {
        id: { not: imovel.id },
        bairroId: imovel.bairroId,
        tipo: imovel.tipo,
        status: 'DISPONIVEL',
        preco: { gte: preco * 0.8, lte: preco * 1.2 },
      },
      take: 4,
      include: {
        bairro: { select: { nome: true, slug: true } },
        cidade: { select: { nome: true, slug: true } },
      },
    })

    return reply.send({ data: imovel, similares })
  })
}
