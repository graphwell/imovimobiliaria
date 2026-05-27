import type { FastifyInstance } from 'fastify'

export default async function statsRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
  }, async (_request, reply) => {
    const [totalImoveis, totalBairros, totalCidades] = await Promise.all([
      fastify.prisma.imovel.count({ where: { status: 'DISPONIVEL' } }),
      fastify.prisma.bairro.count({ where: { ativo: true } }),
      fastify.prisma.cidade.count({ where: { ativo: true } }),
    ])
    return reply.send({ totalImoveis, totalBairros, totalCidades })
  })
}
