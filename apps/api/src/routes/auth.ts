import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '5 minutes' } },
  }, async (request, reply) => {
    const { email, senha } = z.object({
      email: z.string().email(),
      senha: z.string().min(6),
    }).parse(request.body)

    const user = await fastify.prisma.user.findUnique({ where: { email, ativo: true } })
    if (!user) return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Credenciais inválidas' })

    const senhaValida = await bcrypt.compare(senha, user.senhaHash)
    if (!senhaValida) return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Credenciais inválidas' })

    const token = fastify.jwt.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '7d' })

    reply.setCookie('imov_token', token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return reply.send({ success: true, token, data: { id: user.id, nome: user.nome, email: user.email, role: user.role } })
  })

  fastify.get('/me', async (request, reply) => {
    try {
      await request.jwtVerify({ onlyCookie: true })
      const payload = request.user as { sub: string }
      const user = await fastify.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, nome: true, email: true, role: true },
      })
      if (!user) return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Usuário não encontrado' })
      return reply.send({ data: user })
    } catch {
      return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Não autenticado' })
    }
  })

  fastify.post('/logout', async (_request, reply) => {
    reply.clearCookie('imov_token', { path: '/' })
    return reply.send({ success: true })
  })
}
