'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth'
import type { AuthResponse } from '@/types'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const params = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isRegister = mode === 'register'
  const expired = params.get('session') === 'expired'
  const redirect = params.get('redirect')
  const destination = redirect && redirect.startsWith('/') ? redirect : '/account/profile'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const payload = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const { data } = await apiClient.post<AuthResponse>(
        isRegister ? '/auth/register' : '/auth/login',
        payload,
      )
      setSession(data)
      router.push(destination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">{isRegister ? 'Créer un compte' : 'Connexion'}</h1>

      {expired && !isRegister && (
        <p className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
          Votre session a expiré. Merci de vous reconnecter.
        </p>
      )}

      {isRegister && (
        <div className="grid grid-cols-2 gap-3">
          <input name="firstName" required placeholder="Prénom" className="input" />
          <input name="lastName" required placeholder="Nom" className="input" />
        </div>
      )}

      <input name="email" type="email" required placeholder="Email" className="input" />
      <input
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Mot de passe"
        className="input"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? '…' : isRegister ? 'Créer mon compte' : 'Se connecter'}
      </button>

      <p className="text-center text-sm text-muted">
        {isRegister ? (
          <>
            Déjà un compte ?{' '}
            <Link href="/login" className="text-accent hover:underline">
              Se connecter
            </Link>
          </>
        ) : (
          <>
            Pas encore de compte ?{' '}
            <Link href="/signup" className="text-accent hover:underline">
              S&apos;inscrire
            </Link>
          </>
        )}
      </p>
      {!isRegister && (
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-muted hover:text-light">
            Mot de passe oublié ?
          </Link>
        </p>
      )}
    </form>
  )
}
