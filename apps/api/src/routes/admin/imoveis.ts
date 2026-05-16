import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createImovelSchema } from '../../schemas/imovel.schema.js'
import { parsePagination, buildPaginatedResponse } from '../../utils/pagination.js'
import { slugify } from '../../utils/slug.js'

export default async function adminImoveisRoutes(fastify: FastifyInstance) {
  fastify.get('/imoveis', async (request, reply) => {
    const query = z.object({
      status: z.string().optional(),
      tipo: z.string().optional(),
      bairroSlug: z.string().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }).parse(request.query)

    const { skip, take, page, limit } = parsePagination({ page: query.page, limit: query.limit })
    const where: Record<string, unknown> = {}
    if (query.status) where['status'] = query.status
    if (query.tipo) where['tipo'] = query.tipo
    if (query.bairroSlug) where['bairro'] = { slug: query.bairroSlug }

    const [data, total] = await Promise.all([
      fastify.prisma.imovel.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          bairro: { select: { nome: true, slug: true } },
          cidade: { select: { nome: true, slug: true } },
        },
      }),
      fastify.prisma.imovel.count({ where }),
    ])

    return reply.send(buildPaginatedResponse(data, total, page, limit))
  })

  fastify.post('/imoveis', async (request, reply) => {
    const body = createImovelSchema.parse(request.body)
    const slug = body.slug ?? slugify(`${body.titulo} ${body.endereco}`)

    const imovel = await fastify.prisma.imovel.create({
      data: {
        ...body,
        slug,
        fotos: body.fotos,
        publicadoAt: body.status === 'DISPONIVEL' ? new Date() : null,
      },
    })

    return reply.code(201).send({ success: true, data: imovel })
  })

  fastify.put('/imoveis/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const body = createImovelSchema.partial().parse(request.body)

    const imovel = await fastify.prisma.imovel.update({
      where: { id },
      data: { ...body, fotos: body.fotos },
    })

    return reply.send({ success: true, data: imovel })
  })

  fastify.patch('/imoveis/:id/status', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { status, destaque } = z.object({
      status: z.enum(['DISPONIVEL', 'VENDIDO', 'ALUGADO', 'RESERVADO', 'INATIVO']).optional(),
      destaque: z.boolean().optional(),
    }).parse(request.body)

    const imovel = await fastify.prisma.imovel.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(destaque != null ? { destaque } : {}),
      },
    })

    return reply.send({ success: true, data: imovel })
  })

  fastify.delete('/imoveis/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    await fastify.prisma.imovel.update({ where: { id }, data: { status: 'INATIVO' } })
    return reply.send({ success: true })
  })
}
