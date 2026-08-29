import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { AuthError } from './auth'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function fail(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status })
}

/**
 * Wraps a route handler with consistent error handling.
 */
export function handle<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args)
    } catch (err) {
      if (err instanceof AuthError) {
        return fail(err.status === 401 ? 'AUTH_ERROR' : 'PERMISSION_ERROR', err.message, err.status)
      }
      if (err instanceof ZodError) {
        return fail(
          'VALIDATION_ERROR',
          'Données invalides',
          400,
          err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        )
      }
      console.error('[api] unhandled error', err)
      return fail('SERVER_ERROR', 'Erreur serveur interne', 500)
    }
  }
}
