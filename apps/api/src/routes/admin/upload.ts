import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
}

export default async function adminUploadRoutes(fastify: FastifyInstance) {
  fastify.post('/upload/imagem', async (request, reply) => {
    const data = await request.file()
    if (!data) return reply.code(400).send({ error: 'Nenhum arquivo enviado' })

    if (!ALLOWED_MIME.has(data.mimetype)) {
      return reply.code(400).send({ error: 'Formato não suportado. Use JPG, PNG, WebP ou MP4.' })
    }

    const ext = EXT_MAP[data.mimetype] ?? 'jpg'
    const fileName = `${Date.now()}-${randomUUID()}.${ext}`
    const buffer = await data.toBuffer()

    const supabaseUrl = process.env['SUPABASE_URL']
    const supabaseKey = process.env['SUPABASE_SERVICE_KEY']

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase não configurado (SUPABASE_URL / SUPABASE_SERVICE_KEY)')
    }

    const response = await fetch(`${supabaseUrl}/storage/v1/object/imoveis/${fileName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': data.mimetype,
      },
      body: buffer,
    })

    if (!response.ok) {
      const err = await response.text()
      fastify.log.error(`Supabase upload error: ${err}`)
      throw new Error('Erro ao enviar arquivo para o storage')
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/imoveis/${fileName}`
    return reply.send({ success: true, url: publicUrl })
  })
}
