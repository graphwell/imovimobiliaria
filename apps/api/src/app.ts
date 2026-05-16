import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
      transport:
        process.env['NODE_ENV'] === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // Plugins globais
  await app.register(cors, {
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    credentials: true,
  })

  await app.register(cookie)

  await app.register(rateLimit, {
    global: false,
    max: 60,
    timeWindow: '1 minute',
  })

  // Decorators
  app.decorate('prisma', prisma)

  // Error handler global
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error)
    const statusCode = error.statusCode ?? 500
    reply.code(statusCode).send({
      statusCode,
      error: error.name ?? 'Internal Server Error',
      message: error.message ?? 'Erro interno do servidor',
    })
  })

  // Rotas
  await app.register(import('./routes/imoveis.js'), { prefix: '/imoveis' })
  await app.register(import('./routes/bairros.js'), { prefix: '/bairros' })
  await app.register(import('./routes/leads.js'), { prefix: '/leads' })
  await app.register(import('./routes/artigos.js'), { prefix: '/artigos' })
  await app.register(import('./routes/empreendimentos.js'), { prefix: '/empreendimentos' })
  await app.register(import('./routes/auth.js'), { prefix: '/auth' })
  await app.register(import('./routes/seo.js'), { prefix: '/seo' })
  await app.register(import('./routes/admin/index.js'), { prefix: '/admin' })

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return { app, prisma }
}

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

import type { FastifyRequest, FastifyReply } from 'fastify'
