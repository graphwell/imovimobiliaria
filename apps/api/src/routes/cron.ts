import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { syncImoveisRecentes } from '../jobs/googleBusinessSync.js'
import { submitSitemap } from '../jobs/sitemapSubmit.js'

// Rotas chamadas pelos Vercel Cron Jobs (ver vercel.json) ou por um gatilho
// externo (ex: cron-job.org) configurado com o mesmo header de autorização.
// Substituem o node-cron, que dependia de um processo Node de longa duração —
// incompatível com funções serverless.
function authorized(request: FastifyRequest, reply: FastifyReply): boolean {
  const secret = process.env['CRON_SECRET']
  if (!secret) {
    reply.code(500).send({ error: 'CRON_SECRET não configurado no servidor' })
    return false
  }
  if (request.headers.authorization !== `Bearer ${secret}`) {
    reply.code(401).send({ error: 'Unauthorized' })
    return false
  }
  return true
}

export default async function cronRoutes(fastify: FastifyInstance) {
  // Diariamente — sincroniza imóveis novos com Google Meu Negócio
  fastify.post('/gbp-sync', async (request, reply) => {
    if (!authorized(request, reply)) return

    await syncImoveisRecentes(fastify.prisma)
    return reply.send({ success: true })
  })

  // Semanalmente — submete sitemap ao Search Console
  fastify.post('/sitemap-submit', async (request, reply) => {
    if (!authorized(request, reply)) return

    const result = await submitSitemap(fastify.prisma)
    return reply.send({ success: result.submitted, ...result })
  })
}
