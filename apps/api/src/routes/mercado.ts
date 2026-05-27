import type { FastifyInstance } from 'fastify'

export default async function mercadoRoutes(fastify: FastifyInstance) {
  fastify.get('/indicadores', {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, async (_request, reply) => {
    const [bairros, totalImoveis] = await Promise.all([
      fastify.prisma.bairro.findMany({
        where: { ativo: true },
        select: { nome: true, precoM2MedioVenda: true, valorizacao12meses: true },
      }),
      fastify.prisma.imovel.count({ where: { status: 'DISPONIVEL' } }),
    ])

    const comPreco = bairros.filter(b => b.precoM2MedioVenda != null)
    const comValorizacao = bairros.filter(b => b.valorizacao12meses != null)

    if (comPreco.length === 0 && totalImoveis === 0) {
      return reply.send(null)
    }

    const precoM2Medio = comPreco.length > 0
      ? Math.round(comPreco.reduce((acc, b) => acc + Number(b.precoM2MedioVenda), 0) / comPreco.length)
      : null

    const valorizacaoMedia = comValorizacao.length > 0
      ? Number((comValorizacao.reduce((acc, b) => acc + Number(b.valorizacao12meses), 0) / comValorizacao.length).toFixed(1))
      : null

    const bairroEmAlta = comValorizacao.length > 0
      ? [...comValorizacao].sort((a, b) => Number(b.valorizacao12meses) - Number(a.valorizacao12meses))[0].nome
      : null

    return reply.send({ precoM2Medio, valorizacao12meses: valorizacaoMedia, bairroEmAlta, totalImoveis })
  })
}
