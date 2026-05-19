import type { MetadataRoute } from 'next'

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'https://api.somar.ia.br'
const SITE = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://imov.somar.ia.br'

const STATIC: MetadataRoute.Sitemap = [
  { url: SITE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  { url: `${SITE}/imoveis`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  { url: `${SITE}/lancamentos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${SITE}/simulador/consorcio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${SITE}/simulador/financiamento`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
]

interface SeoUrl {
  url: string
  priority?: number
  changefreq?: string
  lastmod?: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API}/seo/sitemap-urls`, { next: { revalidate: 3600 } })
    if (!res.ok) return STATIC
    const { data }: { data: SeoUrl[] } = await res.json()
    const dynamic: MetadataRoute.Sitemap = data.map(item => ({
      url: item.url.startsWith('http') ? item.url : `${SITE}${item.url}`,
      lastModified: item.lastmod ? new Date(item.lastmod) : new Date(),
      changeFrequency: (item.changefreq ?? 'weekly') as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: item.priority ?? 0.6,
    }))
    return [...STATIC, ...dynamic]
  } catch {
    return STATIC
  }
}
