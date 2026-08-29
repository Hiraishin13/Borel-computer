'use client'

import { useAuthStore } from '@/store/auth'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Informations personnelles</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Nom</dt>
          <dd>{user?.firstName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Email</dt>
          <dd>{user?.email}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Rôle</dt>
          <dd className="capitalize">{user?.role}</dd>
        </div>
      </dl>
    </div>
  )
}
