import type { PrismaClient } from '@prisma/client'
import {
  submitSitemap as doSubmit,
  getSitemapStatus,
} from '../services/searchConsoleService.js'

export async function submitSitemap(prisma: PrismaClient): Promise<{
  submitted: boolean
  sitemapUrl?: string
  status?: unknown
  error?: string
}> {
  try {
    const result = await doSubmit(prisma)
    const status = await getSitemapStatus(prisma)
    console.log(`[Sitemap] Submetido: ${result.submitted}`)
    return { submitted: true, sitemapUrl: result.submitted, status }
  } catch (err) {
    console.error('[Sitemap] Erro ao submeter:', err)
    return { submitted: false, error: String(err) }
  }
}
