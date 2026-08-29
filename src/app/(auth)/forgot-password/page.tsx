'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    try {
      await apiClient.post('/auth/forgot-password', { email })
    } finally {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <p className="text-sm text-muted">
        Si un compte existe pour cette adresse, un email de réinitialisation vient d&apos;être envoyé.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Mot de passe oublié</h1>
      <p className="text-sm text-muted">
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>
      <input name="email" type="email" required placeholder="Email" className="input" />
      <button type="submit" className="btn-primary w-full">
        Envoyer le lien
      </button>
    </form>
  )
}
