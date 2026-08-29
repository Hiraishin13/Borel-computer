import { NextRequest } from 'next/server'
import { runSeed } from '@/lib/seed'
import { handle, ok, fail } from '@/lib/api-response'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Amorçage de la base en production (one-shot).
 * Protégé par l'en-tête `x-setup-token` qui doit valoir `process.env.SETUP_TOKEN`.
 * À utiliser une fois après le premier déploiement, puis retirer la variable SETUP_TOKEN.
 */
export const POST = handle(async (request: NextRequest) => {
  const expected = process.env.SETUP_TOKEN
  if (!expected) {
    return fail('NOT_FOUND', 'Amorçage désactivé (SETUP_TOKEN non défini)', 404)
  }
  if (request.headers.get('x-setup-token') !== expected) {
    return fail('AUTH_ERROR', 'Token invalide', 401)
  }

  const result = await runSeed()
  return ok({
    message: result.adminCreated
      ? 'Base initialisée — admin@borelcomputer.com / admin1234'
      : 'Base mise à jour (admin déjà présent)',
    ...result,
  })
})

export const dynamic = 'force-dynamic'
