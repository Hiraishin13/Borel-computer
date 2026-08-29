'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth'

interface Address {
  id: string
  type: string
  street: string
  city: string
  postalCode: string
  country: string
  default: boolean
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <ProfileCard />
      <PasswordCard />
      <AddressesCard />
    </div>
  )
}

function Feedback({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null
  return (
    <p className={`mt-3 text-sm ${msg.ok ? 'text-success' : 'text-danger'}`}>{msg.text}</p>
  )
}

function ProfileCard() {
  const user = useAuthStore((s) => s.user)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await apiClient.get('/users/me')).data as Record<string, string>,
  })

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.patch('/users/me', body),
    onSuccess: () => setMsg({ ok: true, text: 'Profil mis à jour.' }),
    onError: (e) => setMsg({ ok: false, text: e instanceof Error ? e.message : 'Erreur' }),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        save.mutate({
          firstName: f.get('firstName'),
          lastName: f.get('lastName'),
          phone: f.get('phone') || undefined,
        })
      }}
      className="card p-6"
    >
      <h2 className="text-lg font-semibold">Informations personnelles</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          name="firstName"
          defaultValue={data?.firstName ?? user?.firstName ?? ''}
          placeholder="Prénom"
          className="input"
        />
        <input
          name="lastName"
          defaultValue={data?.lastName ?? ''}
          placeholder="Nom"
          className="input"
        />
        <input
          name="phone"
          defaultValue={data?.phone ?? ''}
          placeholder="Téléphone"
          className="input sm:col-span-2"
        />
      </div>
      <button type="submit" disabled={save.isPending} className="btn-primary mt-4">
        {save.isPending ? '…' : 'Enregistrer'}
      </button>
      <Feedback msg={msg} />
    </form>
  )
}

function PasswordCard() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const change = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post('/users/me/password', body),
    onSuccess: () => setMsg({ ok: true, text: 'Mot de passe modifié.' }),
    onError: (e) => setMsg({ ok: false, text: e instanceof Error ? e.message : 'Erreur' }),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const f = e.currentTarget
        const fd = new FormData(f)
        change.mutate(
          { currentPassword: fd.get('currentPassword'), newPassword: fd.get('newPassword') },
          { onSuccess: () => f.reset() },
        )
      }}
      className="card p-6"
    >
      <h2 className="text-lg font-semibold">Mot de passe</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          name="currentPassword"
          type="password"
          required
          placeholder="Mot de passe actuel"
          className="input"
        />
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          placeholder="Nouveau mot de passe"
          className="input"
        />
      </div>
      <button type="submit" disabled={change.isPending} className="btn-primary mt-4">
        {change.isPending ? '…' : 'Modifier'}
      </button>
      <Feedback msg={msg} />
    </form>
  )
}

function AddressesCard() {
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () =>
      (await apiClient.get<{ data: Address[] }>('/users/me/addresses')).data.data,
  })

  const add = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post('/users/me/addresses', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      setAdding(false)
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/me/addresses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  })

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Adresses</h2>
        <button className="text-sm text-accent hover:underline" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            add.mutate({
              type: f.get('type'),
              street: f.get('street'),
              postalCode: f.get('postalCode'),
              city: f.get('city'),
              country: f.get('country'),
              default: f.get('default') === 'on',
            })
          }}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <select name="type" className="input" defaultValue="shipping">
            <option value="shipping">Livraison</option>
            <option value="billing">Facturation</option>
          </select>
          <input name="street" required placeholder="Adresse" className="input sm:col-span-2" />
          <input name="postalCode" required placeholder="Code postal" className="input" />
          <input name="city" required placeholder="Ville" className="input" />
          <input name="country" required defaultValue="Canada" placeholder="Pays" className="input" />
          <label className="flex items-center gap-2 text-sm">
            <input name="default" type="checkbox" /> Par défaut
          </label>
          <button type="submit" disabled={add.isPending} className="btn-primary sm:col-span-2">
            {add.isPending ? '…' : 'Enregistrer l’adresse'}
          </button>
        </form>
      )}

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-muted">Chargement…</p>}
        {!isLoading && data?.length === 0 && (
          <p className="text-sm text-muted">Aucune adresse enregistrée.</p>
        )}
        {data?.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-md border border-white/10 p-3 text-sm"
          >
            <div>
              <span className="text-xs uppercase text-muted">{a.type}</span>
              {a.default && <span className="ml-2 text-xs text-accent">défaut</span>}
              <p>
                {a.street}, {a.postalCode} {a.city}, {a.country}
              </p>
            </div>
            <button
              onClick={() => remove.mutate(a.id)}
              className="text-xs text-muted hover:text-danger"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
