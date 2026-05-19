import { google } from 'googleapis'
import { existsSync } from 'fs'
import { join } from 'path'

const SPREADSHEET_TITLE = 'IMOV — Leads'
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

const HEADERS = [
  'Data', 'Nome', 'Telefone', 'Email', 'Origem',
  'Interesse', 'Bairro', 'Preço Min', 'Preço Max',
  'Score', 'Status CRM', 'UTM Source',
]

function credentialsPath(): string {
  return process.env['GOOGLE_APPLICATION_CREDENTIALS']
    ?? join(process.cwd(), 'secrets', 'google-service-account.json')
}

function isEnabled(): boolean {
  return existsSync(credentialsPath())
}

function getAuth() {
  return new google.auth.GoogleAuth({
    keyFilename: credentialsPath(),
    scopes: SCOPES,
  })
}

async function getOrCreateSpreadsheetId(): Promise<string> {
  const existing = process.env['GOOGLE_SHEETS_ID']
  if (existing) return existing

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const drive = google.drive({ version: 'v3', auth })

  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: SPREADSHEET_TITLE },
      sheets: [{
        properties: { title: 'Leads' },
        data: [{ startRow: 0, startColumn: 0, rowData: [{ values: HEADERS.map(h => ({ userEnteredValue: { stringValue: h }, userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.106, green: 0.314, blue: 0.847 } } })) }] }],
      }],
    },
  })

  const spreadsheetId = spreadsheet.data.spreadsheetId!

  const adminEmail = process.env['ADMIN_EMAIL']
  if (adminEmail) {
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: { type: 'user', role: 'writer', emailAddress: adminEmail },
      sendNotificationEmail: false,
    }).catch(() => {})
  }

  console.log(`[Sheets] Planilha criada! Adicione ao .env: GOOGLE_SHEETS_ID=${spreadsheetId}`)
  console.log(`[Sheets] URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`)

  return spreadsheetId
}

export interface LeadSheetData {
  createdAt: Date
  nome: string
  telefone: string
  email?: string | null
  origem: string
  interesseTipo?: string | null
  bairroNome?: string | null
  faixaPrecoMin?: number | null
  faixaPrecoMax?: number | null
  score: number
  statusCrm: string
  utmSource?: string | null
}

function fmt(v: number | null | undefined) {
  if (v == null) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export async function appendLeadToSheet(lead: LeadSheetData): Promise<void> {
  if (!isEnabled()) return
  try {
    const auth = getAuth()
    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = await getOrCreateSpreadsheetId()

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Leads!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(lead.createdAt),
          lead.nome,
          lead.telefone,
          lead.email ?? '',
          lead.origem,
          lead.interesseTipo ?? '',
          lead.bairroNome ?? '',
          fmt(lead.faixaPrecoMin),
          fmt(lead.faixaPrecoMax),
          lead.score,
          lead.statusCrm,
          lead.utmSource ?? '',
        ]],
      },
    })
  } catch (err) {
    console.error('[Sheets] Erro ao adicionar lead:', err)
  }
}

export async function getLastRows(count = 5): Promise<string[][]> {
  if (!isEnabled()) return []
  try {
    const auth = getAuth()
    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = await getOrCreateSpreadsheetId()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Leads!A:L' })
    const rows = res.data.values ?? []
    return rows.slice(1).slice(-count)
  } catch (err) {
    console.error('[Sheets] Erro ao buscar linhas:', err)
    return []
  }
}

export async function testConnection(): Promise<{ ok: boolean; spreadsheetId?: string; url?: string; error?: string }> {
  if (!isEnabled()) return { ok: false, error: 'Credenciais não encontradas em secrets/google-service-account.json' }
  try {
    const spreadsheetId = await getOrCreateSpreadsheetId()
    return { ok: true, spreadsheetId, url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}` }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
