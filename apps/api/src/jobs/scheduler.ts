import cron from 'node-cron'
import type { PrismaClient } from '@prisma/client'
import { syncImoveisRecentes } from './googleBusinessSync.js'
import { submitSitemap } from './sitemapSubmit.js'

export function startScheduler(prisma: PrismaClient) {
  // Diariamente às 09:00 — sincroniza imóveis novos com Google Meu Negócio
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Iniciando sync Google Meu Negócio...')
    await syncImoveisRecentes(prisma).catch(err =>
      console.error('[Cron] Erro no sync GBP:', err),
    )
  }, { timezone: 'America/Fortaleza' })

  // Toda segunda-feira às 08:00 — submete sitemap ao Search Console
  cron.schedule('0 8 * * 1', async () => {
    console.log('[Cron] Submetendo sitemap ao Search Console...')
    await submitSitemap(prisma).catch(err =>
      console.error('[Cron] Erro ao submeter sitemap:', err),
    )
  }, { timezone: 'America/Fortaleza' })

  console.log('[Cron] Agendamentos ativos: GBP sync (09:00 diário) | Sitemap (08:00 segundas)')
}
