import type { FastifyInstance } from 'fastify'

export default async function seoRoutes(fastify: FastifyInstance) {
  fastify.get('/sitemap-urls', async (_request, reply) => {
    const [imoveis, bairros, cidades, empreendimentos, artigos] = await Promise.all([
      fastify.prisma.imovel.findMany({
        where: { status: 'DISPONIVEL' },
        select: { slug: true, updatedAt: true },
      }),
      fastify.prisma.bairro.findMany({
        where: { ativo: true },
        select: { slug: true, updatedAt: true },
      }),
      fastify.prisma.cidade.findMany({
        where: { ativo: true },
        select: { slug: true, updatedAt: true },
      }),
      fastify.prisma.empreendimento.findMany({
        select: { slug: true, updatedAt: true },
      }),
      fastify.prisma.artigo.findMany({
        where: { publicado: true },
        select: { slug: true, categoria: true, updatedAt: true },
      }),
    ])

    const urls = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/imoveis', priority: 1.0, changefreq: 'hourly' },
      { url: '/lancamentos', priority: 1.0, changefreq: 'daily' },
      { url: '/guia', priority: 0.8, changefreq: 'weekly' },
      { url: '/simulador/financiamento', priority: 0.7, changefreq: 'monthly' },
      ...cidades.map((c: { slug: string; updatedAt: Date }) => ({ url: `/cidades/${c.slug}`, priority: 1.0, changefreq: 'monthly', lastmod: c.updatedAt })),
      ...bairros.map((b: { slug: string; updatedAt: Date }) => ({ url: `/bairros/${b.slug}`, priority: 0.9, changefreq: 'monthly', lastmod: b.updatedAt })),
      ...imoveis.map((i: { slug: string; updatedAt: Date }) => ({ url: `/imoveis/${i.slug}`, priority: 0.8, changefreq: 'weekly', lastmod: i.updatedAt })),
      ...empreendimentos.map((e: { slug: string; updatedAt: Date }) => ({ url: `/lancamentos/${e.slug}`, priority: 0.8, changefreq: 'weekly', lastmod: e.updatedAt })),
      ...artigos.map((a: { slug: string; categoria: string; updatedAt: Date }) => ({
        url: `/guia/${a.categoria.toLowerCase()}/${a.slug}`,
        priority: 0.7,
        changefreq: 'weekly',
        lastmod: a.updatedAt,
      })),
    ]

    return reply.send({ data: urls })
  })

  fastify.get('/bairro-combinacoes', async (_request, reply) => {
    const combinacoes = await fastify.prisma.imovel.groupBy({
      by: ['tipo', 'quartos'],
      where: { status: 'DISPONIVEL' },
      _count: true,
    })

    const bairros = await fastify.prisma.bairro.findMany({
      where: { ativo: true },
      select: { slug: true, nome: true },
    })

    const params: { bairroSlug: string; tipo: string; quartos?: number }[] = []

    for (const bairro of bairros) {
      for (const combo of combinacoes) {
        if (combo._count > 0) {
          params.push({ bairroSlug: bairro.slug, tipo: combo.tipo.toLowerCase() + 's' })
          if (combo.quartos > 0) {
            params.push({ bairroSlug: bairro.slug, tipo: combo.tipo.toLowerCase() + 's', quartos: combo.quartos })
          }
        }
      }
    }

    return reply.send({ data: params })
  })
}
