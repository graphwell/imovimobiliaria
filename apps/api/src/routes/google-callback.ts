import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { handleCallback } from '../services/googleOAuthService.js'

const FRONTEND_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://imov.somar.ia.br'

export default async function googleCallbackRoute(fastify: FastifyInstance) {
  // Rota pública — não tem JWT. O Google redireciona para cá após autorização.
  fastify.get('/callback', async (request, reply) => {
    const parsed = z.object({
      code: z.string(),
      state: z.string().optional(),
      error: z.string().optional(),
    }).safeParse(request.query)

    if (!parsed.success || parsed.data.error) {
      const reason = parsed.data?.error ?? 'invalid_request'
      return reply.redirect(`${FRONTEND_URL}/admin/integracoes?error=${reason}`)
    }

    try {
      await handleCallback(parsed.data.code, fastify.prisma)
      return reply.redirect(`${FRONTEND_URL}/admin/integracoes?connected=true`)
    } catch (err) {
      fastify.log.error({ err }, 'Google OAuth callback falhou')
      return reply.redirect(`${FRONTEND_URL}/admin/integracoes?error=oauth_failed`)
    }
  })
}
