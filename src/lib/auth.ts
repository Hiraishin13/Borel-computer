import { NextRequest } from 'next/server'
import { verifyToken, type JwtPayload } from './jwt'

/**
 * Extracts and validates the bearer token from a request.
 * Returns the decoded payload or null.
 */
export function getAuth(request: NextRequest): JwtPayload | null {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  return verifyToken(header.slice(7))
}

export class AuthError extends Error {
  constructor(
    public status: 401 | 403,
    message: string,
  ) {
    super(message)
  }
}

export function requireAuth(request: NextRequest): JwtPayload {
  const auth = getAuth(request)
  if (!auth) throw new AuthError(401, 'Token invalide ou expiré')
  return auth
}

export function requireAdmin(request: NextRequest): JwtPayload {
  const auth = requireAuth(request)
  if (auth.role !== 'admin') throw new AuthError(403, 'Accès refusé')
  return auth
}
