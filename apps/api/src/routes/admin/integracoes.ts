import type { FastifyInstance } from 'fastify'
import * as sheets from '../../services/googleSheetsService.js'
import * as gmail from '../../services/gmailService.js'
import * as analytics from '../../services/analyticsService.js'

export default async function integracoesRoutes(fastify: FastifyInstance) {
  fastify.get('/integracoes/status', async (_request, reply) => {
    const [sheetsResult, gmailResult, analyticsResult] = await Promise.all([
      sheets.testConnection(),
      gmail.testConnection(),
      analytics.testConnection(),
    ])

    return reply.send({
      data: {
        sheets: sheetsResult,
        gmail: gmailResult,
        analytics: analyticsResult,
      },
    })
  })

  fastify.get('/integracoes/sheets/linhas', async (_request, reply) => {
    const linhas = await sheets.getLastRows(5)
    return reply.send({ data: linhas })
  })
}
