import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])

const signedUrlSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1),
  contentType: z.string().min(1),
})

// Upload direto do client para o Supabase Storage via signed URL.
// Vercel Serverless Functions (runtime Node) tem limite de ~4.5MB de corpo de
// request, e o pré-processamento de body da Vercel conflita com o parsing de
// stream multipart do @fastify/multipart. Por isso o arquivo em si nunca passa
// pela API — ela só gera a URL assinada (usando a service_role key) e o
// browser faz o PUT diretamente para o Supabase.
export default async function adminUploadRoutes(fastify: FastifyInstance) {
  fastify.post('/upload/signed-url', async (request, reply) => {
    const parsed = signedUrlSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() })
    }
    const { bucket, path, contentType } = parsed.data

    if (!ALLOWED_MIME.has(contentType)) {
      return reply.code(400).send({ error: 'Formato não suportado. Use JPG, PNG, WebP ou MP4.' })
    }

    const supabaseUrl = process.env['SUPABASE_URL']
    const supabaseServiceKey = process.env['SUPABASE_SERVICE_KEY']
    const supabaseAnonKey = process.env['SUPABASE_ANON_KEY']

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error('Supabase não configurado (SUPABASE_URL / SUPABASE_SERVICE_KEY / SUPABASE_ANON_KEY)')
    }

    const response = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const err = await response.text()
      fastify.log.error(`Supabase signed URL error: ${err}`)
      throw new Error('Erro ao gerar URL de upload assinada')
    }

    const data = (await response.json()) as { url: string }
    const uploadUrl = `${supabaseUrl}/storage/v1${data.url}`
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`

    return reply.send({ success: true, uploadUrl, publicUrl, apikey: supabaseAnonKey })
  })
}
