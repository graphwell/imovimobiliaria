import { google } from 'googleapis'
import type { PrismaClient } from '@prisma/client'
import { getValidClient } from './googleOAuthService.js'

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://imov.somar.ia.br'

async function getWebmastersClient(prisma: PrismaClient) {
  const auth = await getValidClient(prisma)
  if (!auth) throw new Error('Google OAuth não conectado.')
  return google.searchconsole({ version: 'v1', auth })
}

export async function getSitemapStatus(prisma: PrismaClient) {
  const sc = await getWebmastersClient(prisma)
  const res = await sc.sitemaps.list({ siteUrl: SITE_URL })
  return res.data.sitemap ?? []
}

export async function submitSitemap(prisma: PrismaClient, sitemapUrl?: string) {
  const sc = await getWebmastersClient(prisma)
  const url = sitemapUrl ?? `${SITE_URL}/sitemap.xml`
  await sc.sitemaps.submit({ siteUrl: SITE_URL, feedpath: url })
  return { submitted: url }
}

export async function getSearchAnalytics(
  prisma: PrismaClient,
  startDate?: string,
  endDate?: string,
) {
  const sc = await getWebmastersClient(prisma)
  const end = endDate ?? new Date().toISOString().slice(0, 10)
  const start = startDate ?? new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [queries, totals] = await Promise.all([
    sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: ['query'],
        rowLimit: 10,
      },
    }),
    sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: [],
        rowLimit: 1,
      },
    }),
  ])

  const total = totals.data.rows?.[0]

  return {
    startDate: start,
    endDate: end,
    totals: {
      clicks: total?.clicks ?? 0,
      impressions: total?.impressions ?? 0,
      ctr: total?.ctr ? +(total.ctr * 100).toFixed(1) : 0,
      position: total?.position ? +total.position.toFixed(1) : 0,
    },
    topQueries: (queries.data.rows ?? [])
      .sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0))
      .slice(0, 5)
      .map(r => ({
      query: r.keys?.[0] ?? '',
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      position: r.position ? +r.position.toFixed(1) : 0,
    })),
  }
}

export async function testConnection(prisma: PrismaClient): Promise<{ ok: boolean; siteVerified?: boolean; error?: string }> {
  try {
    const sc = await getWebmastersClient(prisma)
    const res = await sc.sites.list()
    const sites = res.data.siteEntry ?? []
    const siteVerified = sites.some(s => s.siteUrl?.includes('somar.ia.br') || s.siteUrl?.includes('imov'))
    return { ok: true, siteVerified }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
