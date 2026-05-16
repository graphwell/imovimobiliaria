import type { FastifyInstance } from 'fastify'

export default async function adminDashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/dashboard/metricas', async (_request, reply) => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const semanaAtras = new Date(hoje)
    semanaAtras.setDate(semanaAtras.getDate() - 7)

    const [
      totalImoveis,
      imoveisAtivos,
      leadsHoje,
      leadsSemana,
      leadsPorOrigem,
      leadsPorStatus,
      ultimosLeads,
    ] = await Promise.all([
      fastify.prisma.imovel.count(),
      fastify.prisma.imovel.count({ where: { status: 'DISPONIVEL' } }),
      fastify.prisma.lead.count({ where: { createdAt: { gte: hoje } } }),
      fastify.prisma.lead.count({ where: { createdAt: { gte: semanaAtras } } }),
      fastify.prisma.lead.groupBy({
        by: ['origem'],
        _count: true,
        orderBy: { _count: { origem: 'desc' } },
      }),
      fastify.prisma.lead.groupBy({
        by: ['statusCrm'],
        _count: true,
      }),
      fastify.prisma.lead.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, nome: true, telefone: true, origem: true, score: true,
          statusCrm: true, createdAt: true,
          imovel: { select: { titulo: true, slug: true } },
        },
      }),
    ])

    const totalLeads = await fastify.prisma.lead.count()
    const qualificados = leadsPorStatus.find((l: { statusCrm: string; _count: number }) => l.statusCrm === 'QUALIFICADO')?._count ?? 0
    const taxaQualificacao = totalLeads > 0 ? Math.round((qualificados / totalLeads) * 100) : 0

    return reply.send({
      data: {
        totalImoveis,
        imoveisAtivos,
        leadsHoje,
        leadsSemana,
        taxaQualificacao,
        leadsPorOrigem: leadsPorOrigem.map((l: { origem: string; _count: number }) => ({ origem: l.origem, count: l._count })),
        leadsPorStatus: leadsPorStatus.map((l: { statusCrm: string; _count: number }) => ({ status: l.statusCrm, count: l._count })),
        ultimosLeads,
      },
    })
  })
}
