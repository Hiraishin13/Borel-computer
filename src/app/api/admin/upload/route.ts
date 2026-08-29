import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { requireAdmin } from '@/lib/auth'
import { handle, ok, fail } from '@/lib/api-response'

export const runtime = 'nodejs'

const MAX_BYTES = 6 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
}

/**
 * Import d'images produit depuis le poste de l'admin.
 * Prod : Vercel Blob (BLOB_READ_WRITE_TOKEN). Dev : dossier public/uploads.
 */
export const POST = handle(async (request: NextRequest) => {
  requireAdmin(request)

  const form = await request.formData()
  const files = form.getAll('files').filter((f): f is File => f instanceof File)
  if (files.length === 0) return fail('VALIDATION_ERROR', 'Aucun fichier', 400)
  if (files.length > 8) return fail('VALIDATION_ERROR', 'Maximum 8 images', 400)

  const token = process.env.BLOB_READ_WRITE_TOKEN
  const urls: string[] = []

  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      return fail('VALIDATION_ERROR', `Format non supporté : ${file.type}`, 400)
    }
    if (file.size > MAX_BYTES) {
      return fail('VALIDATION_ERROR', `${file.name} dépasse 6 Mo`, 400)
    }

    const ext = EXT[file.type] ?? 'bin'
    const key = `products/${randomUUID()}.${ext}`

    if (token) {
      const { put } = await import('@vercel/blob')
      const blob = await put(key, file, { access: 'public', token, contentType: file.type })
      urls.push(blob.url)
    } else {
      const dir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(dir, { recursive: true })
      const name = `${randomUUID()}.${ext}`
      await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()))
      urls.push(`/uploads/${name}`)
    }
  }

  return ok({ urls }, 201)
})

export const dynamic = 'force-dynamic'
