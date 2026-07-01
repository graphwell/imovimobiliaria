import { buildApp } from './app.js'

const PORT = Number(process.env['PORT'] ?? 3001)
const HOST = process.env['HOST'] ?? '0.0.0.0'

// Entrypoint usado em desenvolvimento local (pnpm dev) e como fallback caso a
// API seja hospedada em um servidor de longa duração. Em produção (Vercel) o
// entrypoint real é apps/api/api/index.ts — este arquivo não é usado lá.
// Os jobs que antes rodavam via node-cron (startScheduler) viraram rotas HTTP
// em src/routes/cron.ts, disparadas pelo Vercel Cron Job (ver vercel.json).
async function start() {
  const { app } = await buildApp()

  try {
    await app.listen({ port: PORT, host: HOST })
    app.log.info(`🚀 API IMOV rodando em http://${HOST}:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
