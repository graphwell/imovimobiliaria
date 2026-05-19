import type { PrismaClient } from '@prisma/client'
import { getValidClient } from './googleOAuthService.js'

const ACCOUNT_BASE = 'https://mybusinessaccountmanagement.googleapis.com/v1'
const INFO_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const POSTS_BASE = 'https://mybusiness.googleapis.com/v4'

async function authHeader(prisma: PrismaClient): Promise<string> {
  const client = await getValidClient(prisma)
  if (!client) throw new Error('Google OAuth não conectado. Acesse /admin/integracoes para autorizar.')
  const token = await client.getAccessToken()
  return `Bearer ${token.token}`
}

async function gFetch<T = Record<string, unknown>>(url: string, auth: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Google API ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

// ─── Contas / Estabelecimentos ────────────────────────────────────────────────

export async function getAccounts(prisma: PrismaClient) {
  const auth = await authHeader(prisma)
  const data = await gFetch<{ accounts?: { name: string; accountName: string; type: string }[] }>(`${ACCOUNT_BASE}/accounts`, auth)
  return data.accounts ?? []
}

export interface Location {
  name: string
  title: string
  storefrontAddress?: { addressLines: string[] }
  websiteUri?: string
  openInfo?: { status: string }
}

export async function getLocations(prisma: PrismaClient, accountName: string): Promise<Location[]> {
  const auth = await authHeader(prisma)
  const data = await gFetch<{ locations?: Location[] }>(
    `${INFO_BASE}/${accountName}/locations?readMask=name,title,storefrontAddress,websiteUri,openInfo`,
    auth,
  )
  return data.locations ?? []
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export interface PostInput {
  summary: string
  callToActionType?: 'LEARN_MORE' | 'BOOK' | 'CALL' | 'ORDER' | 'BUY' | 'SIGN_UP' | 'VISIT'
  callToActionUrl?: string
  mediaUrl?: string
}

export async function createPost(prisma: PrismaClient, locationName: string, post: PostInput) {
  const auth = await authHeader(prisma)
  const body: Record<string, unknown> = {
    topicType: 'STANDARD',
    summary: post.summary,
  }

  if (post.callToActionType && post.callToActionUrl) {
    body['callToAction'] = { actionType: post.callToActionType, url: post.callToActionUrl }
  }

  if (post.mediaUrl) {
    body['media'] = [{ mediaFormat: 'PHOTO', sourceUrl: post.mediaUrl }]
  }

  return gFetch(`${POSTS_BASE}/${locationName}/localPosts`, auth, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getPosts(prisma: PrismaClient, locationName: string) {
  const auth = await authHeader(prisma)
  const data = await gFetch<{ localPosts?: unknown[] }>(`${POSTS_BASE}/${locationName}/localPosts`, auth)
  return data.localPosts ?? []
}

// ─── Avaliações ───────────────────────────────────────────────────────────────

export async function getReviews(prisma: PrismaClient, locationName: string) {
  const auth = await authHeader(prisma)
  const data = await gFetch<{ reviews?: unknown[] }>(`${POSTS_BASE}/${locationName}/reviews`, auth)
  return data.reviews ?? []
}

export async function replyToReview(
  prisma: PrismaClient,
  locationName: string,
  reviewId: string,
  reply: string,
) {
  const auth = await authHeader(prisma)
  return gFetch(`${POSTS_BASE}/${locationName}/reviews/${reviewId}/reply`, auth, {
    method: 'PUT',
    body: JSON.stringify({ comment: reply }),
  })
}

// ─── Insights ────────────────────────────────────────────────────────────────

export async function getInsights(prisma: PrismaClient, locationName: string) {
  const auth = await authHeader(prisma)
  const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
  return gFetch(
    `https://businessprofileperformance.googleapis.com/v1/${locationName}:fetchMultiDailyMetricsTimeSeries?` +
      `dailyMetric=BUSINESS_IMPRESSIONS_DESKTOP_MAPS&dailyMetric=CALL_CLICKS&dailyMetric=WEBSITE_CLICKS&` +
      `dailyRange.start_date.year=${startDate.getFullYear()}&dailyRange.start_date.month=${startDate.getMonth() + 1}&dailyRange.start_date.day=${startDate.getDate()}`,
    auth,
  )
}
