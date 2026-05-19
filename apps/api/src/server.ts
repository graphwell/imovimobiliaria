import { buildApp } from './app.js'
import { startScheduler } from './jobs/scheduler.js'

const PORT = Number(process.env['PORT'] ?? 3001)
const HOST = process.env['HOST'] ?? '0.0.0.0'

async function start() {
  const { app, prisma } = await buildApp()

  try {
    await app.listen({ port: PORT, host: HOST })
    app.log.info(`🚀 API IMOV rodando em http://${HOST}:${PORT}`)
    startScheduler(prisma)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
