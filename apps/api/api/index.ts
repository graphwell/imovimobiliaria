import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildApp } from '../src/app'

// Entrypoint da API como função serverless da Vercel.
// Mantém o app Fastify (rotas, plugins de auth/cors/multipart/rate-limit)
// intactos — em vez de listen() em uma porta, injeta a request/response do
// Vercel direto no servidor HTTP interno do Fastify. A instância fica em
// memória entre invocações "quentes" do mesmo runtime (evita reconstruir o
// app e a conexão Prisma a cada chamada).
let appPromise: ReturnType<typeof buildApp> | null = null

function getApp() {
  if (!appPromise) appPromise = buildApp()
  return appPromise
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { app } = await getApp()
  await app.ready()

  // app.server.emit() dispara o request handling do Fastify de forma
  // assíncrona, mas não espera a resposta terminar. Sem aguardar aqui, a
  // Vercel considera a invocação concluída assim que emit() retorna —
  // antes do Fastify escrever em `res` — e pode congelar/encerrar a função
  // com a resposta incompleta.
  await new Promise<void>((resolve, reject) => {
    res.on('finish', resolve)
    res.on('close', resolve)
    res.on('error', reject)
    app.server.emit('request', req, res)
  })
}
