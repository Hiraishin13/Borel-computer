import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = { title: 'Inscription' }

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Chargement…</div>}>
      <AuthForm mode="register" />
    </Suspense>
  )
}
