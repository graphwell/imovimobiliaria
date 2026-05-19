import nodemailer from 'nodemailer'

function getTransporter() {
  const user = process.env['SMTP_USER']
  const pass = process.env['SMTP_PASS']
  if (!user || !pass) return null

  return nodemailer.createTransport({
    host: process.env['SMTP_HOST'] ?? 'smtp.gmail.com',
    port: parseInt(process.env['SMTP_PORT'] ?? '587'),
    secure: process.env['SMTP_PORT'] === '465',
    auth: { user, pass },
  })
}

function scoreBadge(score: number): string {
  const color = score >= 70 ? '#16a34a' : '#d97706'
  const bg = score >= 70 ? '#dcfce7' : '#fef3c7'
  const label = score >= 70 ? 'Lead Quente' : 'Lead Qualificado'
  return `<span style="background:${bg};color:${color};padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700;">${label} — Score ${score}</span>`
}

function fmtCurrency(v: number | null | undefined) {
  if (v == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function buildHtml(lead: AlertLeadData): string {
  const adminUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://imov.somar.ia.br'
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B4FD8,#0d2545);padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">IMOV Imobiliária</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,.7);font-size:13px;">Novo lead qualificado recebido</p>
          </td>
        </tr>
        <!-- Badge -->
        <tr>
          <td style="padding:24px 32px 8px;">
            ${scoreBadge(lead.score)}
          </td>
        </tr>
        <!-- Lead info -->
        <tr>
          <td style="padding:8px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                  <span style="color:#6b7280;font-size:13px;">Nome</span><br>
                  <strong style="color:#111;font-size:15px;">${lead.nome}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                  <span style="color:#6b7280;font-size:13px;">Telefone</span><br>
                  <strong style="color:#111;font-size:15px;">${lead.telefone}</strong>
                </td>
              </tr>
              ${lead.email ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><span style="color:#6b7280;font-size:13px;">Email</span><br><strong style="color:#111;font-size:15px;">${lead.email}</strong></td></tr>` : ''}
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                  <span style="color:#6b7280;font-size:13px;">Origem</span><br>
                  <strong style="color:#111;font-size:15px;">${lead.origem}</strong>
                </td>
              </tr>
              ${lead.bairroNome ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><span style="color:#6b7280;font-size:13px;">Bairro de interesse</span><br><strong style="color:#111;font-size:15px;">${lead.bairroNome}</strong></td></tr>` : ''}
              ${lead.faixaPrecoMin != null || lead.faixaPrecoMax != null ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><span style="color:#6b7280;font-size:13px;">Faixa de preço</span><br><strong style="color:#111;font-size:15px;">${fmtCurrency(lead.faixaPrecoMin)} — ${fmtCurrency(lead.faixaPrecoMax)}</strong></td></tr>` : ''}
              ${lead.utmSource ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><span style="color:#6b7280;font-size:13px;">UTM Source</span><br><strong style="color:#111;font-size:15px;">${lead.utmSource}</strong></td></tr>` : ''}
              ${lead.simuladorDados ? `<tr><td style="padding:8px 0;background:#f8faff;border-radius:8px;margin-top:8px;"><span style="color:#6b7280;font-size:13px;">Dados do simulador</span><br><pre style="color:#1B4FD8;font-size:12px;margin:4px 0 0;white-space:pre-wrap;">${JSON.stringify(lead.simuladorDados, null, 2)}</pre></td></tr>` : ''}
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;">
            <a href="${adminUrl}/admin/leads" style="display:inline-block;background:#1B4FD8;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
              Ver no Painel Admin →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">IMOV Imobiliária · Fortaleza/CE · Notificação automática</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export interface AlertLeadData {
  nome: string
  telefone: string
  email?: string | null
  origem: string
  score: number
  bairroNome?: string | null
  interesseTipo?: string | null
  faixaPrecoMin?: number | null
  faixaPrecoMax?: number | null
  utmSource?: string | null
  simuladorDados?: Record<string, unknown> | null
}

export async function enviarAlertaLead(lead: AlertLeadData): Promise<void> {
  if (lead.score < 50) return

  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[Gmail] SMTP não configurado (SMTP_USER/SMTP_PASS ausentes) — email não enviado')
    return
  }

  const adminEmail = process.env['ADMIN_EMAIL']
  if (!adminEmail) {
    console.warn('[Gmail] ADMIN_EMAIL não configurado — email não enviado')
    return
  }

  try {
    await transporter.sendMail({
      from: `"IMOV Imobiliária" <${process.env['SMTP_USER']}>`,
      to: adminEmail,
      subject: `[IMOV] Novo lead qualificado: ${lead.nome} (Score ${lead.score})`,
      html: buildHtml(lead),
    })
  } catch (err) {
    console.error('[Gmail] Erro ao enviar email:', err)
  }
}

export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  const transporter = getTransporter()
  if (!transporter) return { ok: false, error: 'SMTP_USER e SMTP_PASS não configurados' }

  try {
    await transporter.verify()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
