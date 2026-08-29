import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from './env'
import type { UserRole } from '@/types'

export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
}

export function signToken(
  payload: JwtPayload,
  expiresIn: SignOptions['expiresIn'] = '7d',
): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret) as JwtPayload
  } catch {
    return null
  }
}
