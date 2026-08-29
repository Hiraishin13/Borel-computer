import { NextRequest, NextResponse } from 'next/server'
import { runSeed } from '@/lib/seed'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

/**
 * Amorçage de la base en production (one-shot).
 * Protégé par l'en-tête `x-setup-token` qui doit valoir `process.env.SETUP_TOKEN`.
 * À utiliser une fois après le premier déploiement, puis retirer la variable SETUP_TOKEN.
 * Renvoie l'erreur réelle (utile pour diagnostiquer la connexion Mongo).
 */
async function run(request: NextRequest) {
  const expected = process.env.SETUP_TOKEN
  if (!expected) {
    return NextResponse.json(
      { error: 'Amorçage désactivé (SETUP_TOKEN non défini sur Vercel)' },
      { status: 404 },
    )
  }
  const provided =
    request.headers.get('x-setup-token') ?? request.nextUrl.searchParams.get('token')
  if (provided !== expected) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
  }

  try {
    const result = await runSeed()
    return NextResponse.json({
      message: result.adminCreated
        ? 'Base initialisée — admin@borelcomputer.com / admin1234'
        : 'Base mise à jour (admin déjà présent)',
      ...result,
    })
  } catch (err) {
    return NextResponse.json(
      {
        error: 'runSeed a échoué',
        detail: err instanceof Error ? err.message : String(err),
        hint:
          "Vérifie MONGODB_URI (avec /borel-computer), et l'accès réseau Atlas (0.0.0.0/0).",
      },
      { status: 500 },
    )
  }
}

export const POST = run
export const GET = run
