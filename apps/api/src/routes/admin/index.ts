import type { FastifyInstance } from 'fastify'

export default async function adminRoutes(fastify: FastifyInstance) {
  // Middleware: verificar autenticação em todas as rotas /admin
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify({ onlyCookie: true })
    } catch {
      return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Acesso restrito ao painel administrativo' })
    }
  })

  await fastify.register(import('./imoveis.js'))
  await fastify.register(import('./leads.js'))
  await fastify.register(import('./dashboard.js'))
}
