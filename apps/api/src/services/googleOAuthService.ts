import { google } from 'googleapis'
import type { PrismaClient } from '@prisma/client'
import { enviarAlertaLead } from './gmailService.js'

const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.send',
  'openid',
  'email',
  'profile',
]

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET'],
    process.env['GOOGLE_REDIRECT_URI'] ?? 'http://localhost:3001/admin/google/callback',
  )
}

export function getAuthUrl(): string {
  const client = createOAuth2Client()
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: 'imov_oauth',
  })
}

export async function handleCallback(code: string, prisma: PrismaClient): Promise<string> {
  const client = createOAuth2Client()
  const { tokens } = await client.getToken(code)

  client.setCredentials(tokens)
  const oauth2 = google.oauth2({ version: 'v2', auth: client })
  const { data: userInfo } = await oauth2.userinfo.get()

  const expiresAt = new Date(tokens.expiry_date ?? Date.now() + 3_600_000)

  await prisma.googleToken.upsert({
    where: { service: 'google_oauth' },
    update: {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token ?? '',
      expiresAt,
      scopes: SCOPES,
      email: userInfo.email ?? '',
    },
    create: {
      service: 'google_oauth',
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token ?? '',
      expiresAt,
      scopes: SCOPES,
      email: userInfo.email ?? '',
    },
  })

  return userInfo.email ?? ''
}

export async function getValidClient(prisma: PrismaClient) {
  const record = await prisma.googleToken.findUnique({ where: { service: 'google_oauth' } })
  if (!record) return null

  const client = createOAuth2Client()
  client.setCredentials({
    access_token: record.accessToken,
    refresh_token: record.refreshToken,
    expiry_date: record.expiresAt.getTime(),
  })

  // Renova automaticamente se expirado (ou prestes a expirar em 5 min)
  if (record.expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    try {
      const { credentials } = await client.refreshAccessToken()
      const newExpiry = new Date(credentials.expiry_date ?? Date.now() + 3_600_000)

      await prisma.googleToken.update({
        where: { service: 'google_oauth' },
        data: { accessToken: credentials.access_token!, expiresAt: newExpiry },
      })

      client.setCredentials(credentials)
    } catch {
      // Alerta admin sem logar o token
      void enviarAlertaLead({
        nome: 'Sistema IMOV',
        telefone: '-',
        origem: 'SISTEMA',
        score: 100,
        simuladorDados: { alerta: 'OAuth Google expirou e não pôde ser renovado. Acesse /admin/integracoes para reconectar.' },
      })
      return null
    }
  }

  return client
}

export async function revokeToken(prisma: PrismaClient): Promise<void> {
  const record = await prisma.googleToken.findUnique({ where: { service: 'google_oauth' } })
  if (!record) return

  try {
    const client = createOAuth2Client()
    await client.revokeToken(record.accessToken)
  } catch { /* ignora erros de revogação */ }

  await prisma.googleToken.delete({ where: { service: 'google_oauth' } })
}

export async function getConnectionStatus(prisma: PrismaClient): Promise<{
  connected: boolean
  email?: string
  expiresAt?: Date
  scopes?: string[]
  expired?: boolean
}> {
  const record = await prisma.googleToken.findUnique({ where: { service: 'google_oauth' } })
  if (!record) return { connected: false }

  return {
    connected: true,
    email: record.email,
    expiresAt: record.expiresAt,
    scopes: record.scopes,
    expired: record.expiresAt < new Date(),
  }
}
