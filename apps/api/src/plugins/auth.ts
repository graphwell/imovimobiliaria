import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

async function authPlugin(fastify: FastifyInstance) {
  await fastify.register(import('@fastify/jwt'), {
    secret: process.env['JWT_SECRET'] ?? 'imov_dev_secret_change_in_production',
    cookie: {
      cookieName: 'imov_token',
      signed: false,
    },
  })

  fastify.decorate('authenticate', async function (request: Parameters<typeof fastify.authenticate>[0], reply: Parameters<typeof fastify.authenticate>[1]) {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token inválido ou expirado' })
    }
  })
}

export default fp(authPlugin)
