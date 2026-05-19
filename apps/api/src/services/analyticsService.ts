export interface LeadEventParams {
  clientId: string
  value?: number
  currency?: string
  origem: string
  score: number
  bairro?: string | null
  utmSource?: string | null
}

export async function trackLeadEvent(params: LeadEventParams): Promise<void> {
  const measurementId = process.env['GA4_MEASUREMENT_ID']
  const apiSecret = process.env['GA4_API_SECRET']

  if (!measurementId || !apiSecret) return

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: params.clientId,
          events: [{
            name: 'generate_lead',
            params: {
              value: params.value ?? 0,
              currency: params.currency ?? 'BRL',
              origem: params.origem,
              score: params.score,
              bairro: params.bairro ?? '',
              utm_source: params.utmSource ?? '',
            },
          }],
        }),
      },
    )

    if (!res.ok) {
      console.error('[Analytics] Resposta inesperada:', res.status)
    }
  } catch (err) {
    console.error('[Analytics] Erro ao trackear lead:', err)
  }
}

export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  const measurementId = process.env['GA4_MEASUREMENT_ID']
  const apiSecret = process.env['GA4_API_SECRET']

  if (!measurementId || !apiSecret) {
    return { ok: false, error: 'GA4_MEASUREMENT_ID e GA4_API_SECRET não configurados' }
  }

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: 'test_connection',
          events: [{ name: 'test_connection', params: {} }],
        }),
      },
    )
    // GA4 MP retorna 204 em sucesso
    return { ok: res.status === 204 || res.status === 200 }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
