import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import * as oauth from '../../services/googleOAuthService.js'
import * as business from '../../services/googleBusinessService.js'
import * as searchConsole from '../../services/searchConsoleService.js'
import { submitSitemap as submitSitemapJob } from '../../jobs/sitemapSubmit.js'
import { syncImovelToGBP } from '../../jobs/googleBusinessSync.js'

export default async function googleOAuthRoutes(fastify: FastifyInstance) {
  // GET /admin/google/auth-url
  fastify.get('/google/auth-url', async (_req, reply) => {
    if (!process.env['GOOGLE_CLIENT_ID'] || !process.env['GOOGLE_CLIENT_SECRET']) {
      return reply.code(500).send({ error: 'GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET não configurados' })
    }
    return reply.send({ url: oauth.getAuthUrl() })
  })

  // GET /admin/google/status
  fastify.get('/google/status', async (_req, reply) => {
    const status = await oauth.getConnectionStatus(fastify.prisma)
    return reply.send({ data: status })
  })

  // DELETE /admin/google/disconnect
  fastify.delete('/google/disconnect', async (_req, reply) => {
    await oauth.revokeToken(fastify.prisma)
    return reply.send({ success: true })
  })

  // ─── Google Meu Negócio ──────────────────────────────────────────────────

  fastify.get('/google/business/accounts', async (_req, reply) => {
    try {
      const accounts = await business.getAccounts(fastify.prisma)
      return reply.send({ data: accounts })
    } catch (err) {
      return reply.code(503).send({ error: String(err) })
    }
  })

  fastify.get('/google/business/locations', async (request, reply) => {
    const { accountName } = z.object({ accountName: z.string() }).parse(request.query)
    try {
      const locations = await business.getLocations(fastify.prisma, accountName)
      return reply.send({ data: locations })
    } catch (err) {
      return reply.code(503).send({ error: String(err) })
    }
  })

  fastify.post('/google/business/post', async (request, reply) => {
    const body = z.object({
      locationName: z.string(),
      summary: z.string().min(1),
      callToActionType: z.string().optional(),
      callToActionUrl: z.string().url().optional(),
    }).parse(request.body)

    try {
      const post = await business.createPost(fastify.prisma, body.locationName, {
        summary: body.summary,
        callToActionType: body.callToActionType as 'LEARN_MORE' | undefined,
        callToActionUrl: body.callToActionUrl,
      })
      return reply.send({ success: true, data: post })
    } catch (err) {
      return reply.code(503).send({ error: String(err) })
    }
  })

  fastify.get('/google/business/reviews', async (request, reply) => {
    const { locationName } = z.object({ locationName: z.string() }).parse(request.query)
    try {
      const reviews = await business.getReviews(fastify.prisma, locationName)
      return reply.send({ data: reviews })
    } catch (err) {
      return reply.code(503).send({ error: String(err) })
    }
  })

  fastify.post('/google/business/reviews/reply', async (request, reply) => {
    const body = z.object({
      locationName: z.string(),
      reviewId: z.string(),
      reply: z.string().min(1),
    }).parse(request.body)

    try {
      await business.replyToReview(fastify.prisma, body.locationName, body.reviewId, body.reply)
      return reply.send({ success: true })
    } catch (err) {
      return reply.code(503).send({ error: String(err) })
    }
  })

  // ─── Search Console ───────────────────────────────────────────────────────

  fastify.get('/google/search-console/sitemaps', async (_req, reply) => {
    try {
      const sitemaps = await searchConsole.getSitemapStatus(fastify.prisma)
      return reply.send({ data: sitemaps })
    } catch (err) {
      return reply.code(503).send({ error: String(err) })
    }
  })

  fastify.post('/google/search-console/submit-sitemap', async (_req, reply) => {
    try {
      const result = await searchConsole.submitSitemap(fastify.prisma)
      return reply.send({ success: true, data: result })
    } catch (err) {
      return reply.code(503).send({ error: String(err) })
    }
  })

  fastify.get('/google/search-console/analytics', async (request, reply) => {
    const { startDate, endDate } = z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).parse(request.query)

    try {
      const analytics = await searchConsole.getSearchAnalytics(fastify.prisma, startDate, endDate)
      return reply.send({ data: analytics })
    } catch (err) {
      return reply.code(503).send({ error: String(err) })
    }
  })

  // ─── Jobs manuais ─────────────────────────────────────────────────────────

  fastify.post('/google/jobs/submit-sitemap', async (_req, reply) => {
    try {
      const result = await submitSitemapJob(fastify.prisma)
      return reply.send({ success: true, data: result })
    } catch (err) {
      return reply.code(500).send({ error: String(err) })
    }
  })

  fastify.post('/google/jobs/sync-imovel/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    try {
      const result = await syncImovelToGBP(fastify.prisma, id)
      return reply.send({ success: true, data: result })
    } catch (err) {
      return reply.code(500).send({ error: String(err) })
    }
  })
}
