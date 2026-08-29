'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth'
import { Loader } from '@/components/ui/Loader'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <div className="grid gap-6 xl:grid-cols-2">
        <AccountSection />
        <PasswordSection />
        <ShopSection />
        <PricingSection />
        <div className="xl:col-span-2">
          <InvoiceSection />
        </div>
        <div className="xl:col-span-2">
          <TeamSection />
        </div>
      </div>
    </div>
  )
}

function Feedback({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null
  return <p className={`mt-3 text-sm ${msg.ok ? 'text-success' : 'text-danger'}`}>{msg.text}</p>
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/* ---------- Mon compte ---------- */
function AccountSection() {
  const user = useAuthStore((s) => s.user)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await apiClient.get('/users/me')).data as Record<string, string>,
  })
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => apiClient.patch('/users/me', b),
    onSuccess: () => setMsg({ ok: true, text: 'Profil mis à jour.' }),
    onError: (e) => setMsg({ ok: false, text: e instanceof Error ? e.message : 'Erreur' }),
  })

  return (
    <Card title="Mon compte">
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
        className="grid gap-3 sm:grid-cols-2"
      >
        <input name="firstName" defaultValue={data?.firstName ?? user?.firstName ?? ''} placeholder="Prénom" className="input" />
        <input name="lastName" defaultValue={data?.lastName ?? ''} placeholder="Nom" className="input" />
        <input name="phone" defaultValue={data?.phone ?? ''} placeholder="Téléphone" className="input sm:col-span-2" />
        <p className="text-xs text-muted sm:col-span-2">Email : {user?.email}</p>
        <button disabled={save.isPending} className="btn-primary sm:col-span-2">
          {save.isPending ? '…' : 'Enregistrer'}
        </button>
      </form>
      <Feedback msg={msg} />
    </Card>
  )
}

/* ---------- Mot de passe ---------- */
function PasswordSection() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const change = useMutation({
    mutationFn: (b: Record<string, unknown>) => apiClient.post('/users/me/password', b),
    onSuccess: () => setMsg({ ok: true, text: 'Mot de passe modifié.' }),
    onError: (e) => setMsg({ ok: false, text: e instanceof Error ? e.message : 'Erreur' }),
  })
  return (
    <Card title="Mot de passe">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const f = new FormData(form)
          change.mutate(
            { currentPassword: f.get('currentPassword'), newPassword: f.get('newPassword') },
            { onSuccess: () => form.reset() },
          )
        }}
        className="grid gap-3 sm:grid-cols-2"
      >
        <input name="currentPassword" type="password" required placeholder="Mot de passe actuel" className="input" />
        <input name="newPassword" type="password" required minLength={8} placeholder="Nouveau mot de passe" className="input" />
        <button disabled={change.isPending} className="btn-primary sm:col-span-2">
          {change.isPending ? '…' : 'Modifier'}
        </button>
      </form>
      <Feedback msg={msg} />
    </Card>
  )
}

/* ---------- Boutique + Tarification (partagent le même endpoint) ---------- */
interface ShopSettings {
  shopName: string
  contactEmail: string
  whatsappNumber: string
  announcement: string
  announcementActive: boolean
  sellerName: string
  sellerAddress: string
  sellerPhone: string
  sellerEmail: string
  sellerTaxId: string
  invoiceFooter: string
  currency: string
  taxRate: number
  freeShippingThreshold: number
  standardShipping: number
  expressSurcharge: number
  assemblyFee: number
  lowStockThreshold: number
}

function useShopSettings() {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await apiClient.get<ShopSettings>('/admin/settings')).data,
  })
  const save = useMutation({
    mutationFn: (b: Partial<ShopSettings>) => apiClient.patch('/admin/settings', b),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] })
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
  })
  return { query, save }
}

function ShopSection() {
  const { query, save } = useShopSettings()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const s = query.data

  if (query.isLoading || !s) return <Card title="Boutique"><Loader /></Card>

  return (
    <Card title="Boutique">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          save.mutate(
            {
              shopName: String(f.get('shopName')),
              contactEmail: String(f.get('contactEmail')),
              whatsappNumber: String(f.get('whatsappNumber')),
              announcement: String(f.get('announcement')),
              announcementActive: f.get('announcementActive') === 'on',
            },
            {
              onSuccess: () => setMsg({ ok: true, text: 'Boutique mise à jour.' }),
              onError: (e2) =>
                setMsg({ ok: false, text: e2 instanceof Error ? e2.message : 'Erreur' }),
            },
          )
        }}
        className="grid gap-3 sm:grid-cols-2"
      >
        <label className="text-xs text-muted">
          Nom de la boutique
          <input name="shopName" defaultValue={s.shopName} className="input mt-1" />
        </label>
        <label className="text-xs text-muted">
          Email de contact
          <input name="contactEmail" type="email" defaultValue={s.contactEmail} className="input mt-1" />
        </label>
        <label className="text-xs text-muted sm:col-span-2">
          Numéro WhatsApp (reçoit les commandes) — chiffres uniquement
          <input name="whatsappNumber" defaultValue={s.whatsappNumber} placeholder="243973528439" className="input mt-1" />
        </label>
        <label className="text-xs text-muted sm:col-span-2">
          Bandeau d&apos;annonce
          <input name="announcement" defaultValue={s.announcement} maxLength={200} placeholder="Livraison offerte dès 100 $ ce week-end" className="input mt-1" />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input name="announcementActive" type="checkbox" defaultChecked={s.announcementActive} />
          Afficher le bandeau sur le site
        </label>
        <button disabled={save.isPending} className="btn-primary sm:col-span-2">
          {save.isPending ? '…' : 'Enregistrer'}
        </button>
      </form>
      <Feedback msg={msg} />
    </Card>
  )
}

function PricingSection() {
  const { query, save } = useShopSettings()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const s = query.data

  if (query.isLoading || !s) return <Card title="Tarification & stock"><Loader /></Card>

  return (
    <Card title="Tarification & stock">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          const n = (k: string) => Number(f.get(k))
          save.mutate(
            {
              currency: String(f.get('currency')) as ShopSettings['currency'],
              taxRate: n('taxPct') / 100,
              freeShippingThreshold: n('freeShippingThreshold'),
              standardShipping: n('standardShipping'),
              expressSurcharge: n('expressSurcharge'),
              assemblyFee: n('assemblyFee'),
              lowStockThreshold: n('lowStockThreshold'),
            },
            {
              onSuccess: () => setMsg({ ok: true, text: 'Tarifs mis à jour.' }),
              onError: (e2) =>
                setMsg({ ok: false, text: e2 instanceof Error ? e2.message : 'Erreur' }),
            },
          )
        }}
        className="grid gap-3 sm:grid-cols-3"
      >
        <label className="text-xs text-muted">
          Devise
          <select name="currency" defaultValue={s.currency} className="input mt-1">
            {['USD', 'EUR', 'CAD', 'XOF', 'CDF'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Taxes (%)
          <input name="taxPct" type="number" step="0.1" defaultValue={Math.round(s.taxRate * 1000) / 10} className="input mt-1" />
        </label>
        <label className="text-xs text-muted">
          Livraison offerte dès
          <input name="freeShippingThreshold" type="number" step="1" defaultValue={s.freeShippingThreshold} className="input mt-1" />
        </label>
        <label className="text-xs text-muted">
          Livraison standard
          <input name="standardShipping" type="number" step="0.01" defaultValue={s.standardShipping} className="input mt-1" />
        </label>
        <label className="text-xs text-muted">
          Supplément express
          <input name="expressSurcharge" type="number" step="0.01" defaultValue={s.expressSurcharge} className="input mt-1" />
        </label>
        <label className="text-xs text-muted">
          Frais d&apos;assemblage PC
          <input name="assemblyFee" type="number" step="0.01" defaultValue={s.assemblyFee} className="input mt-1" />
        </label>
        <label className="text-xs text-muted">
          Seuil « stock bas »
          <input name="lowStockThreshold" type="number" step="1" defaultValue={s.lowStockThreshold} className="input mt-1" />
        </label>
        <button disabled={save.isPending} className="btn-primary sm:col-span-3">
          {save.isPending ? '…' : 'Enregistrer'}
        </button>
      </form>
      <Feedback msg={msg} />
    </Card>
  )
}

/* ---------- Facture / Vendeur ---------- */
function InvoiceSection() {
  const { query, save } = useShopSettings()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const s = query.data

  if (query.isLoading || !s) return <Card title="Facture (bloc vendeur)"><Loader /></Card>

  return (
    <Card title="Facture (bloc vendeur)">
      <p className="mb-4 text-xs text-muted">
        Ces informations apparaissent dans l&apos;encadré « Vendeur » de la facture PDF et dans les
        emails.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          save.mutate(
            {
              sellerName: String(f.get('sellerName')),
              sellerAddress: String(f.get('sellerAddress')),
              sellerPhone: String(f.get('sellerPhone')),
              sellerEmail: String(f.get('sellerEmail')),
              sellerTaxId: String(f.get('sellerTaxId')),
              invoiceFooter: String(f.get('invoiceFooter')),
            },
            {
              onSuccess: () => setMsg({ ok: true, text: 'Facture mise à jour.' }),
              onError: (e2) =>
                setMsg({ ok: false, text: e2 instanceof Error ? e2.message : 'Erreur' }),
            },
          )
        }}
        className="grid gap-3 sm:grid-cols-2"
      >
        <label className="text-xs text-muted">
          Raison sociale
          <input name="sellerName" defaultValue={s.sellerName} className="input mt-1" />
        </label>
        <label className="text-xs text-muted">
          N° d&apos;identification (RCCM / TVA / SIRET…)
          <input name="sellerTaxId" defaultValue={s.sellerTaxId} className="input mt-1" />
        </label>
        <label className="text-xs text-muted sm:col-span-2">
          Adresse (une ligne par retour à la ligne)
          <textarea
            name="sellerAddress"
            defaultValue={s.sellerAddress}
            rows={2}
            className="input mt-1"
          />
        </label>
        <label className="text-xs text-muted">
          Téléphone
          <input name="sellerPhone" defaultValue={s.sellerPhone} className="input mt-1" />
        </label>
        <label className="text-xs text-muted">
          Email
          <input name="sellerEmail" type="email" defaultValue={s.sellerEmail} className="input mt-1" />
        </label>
        <label className="text-xs text-muted sm:col-span-2">
          Mention légale (bas de facture)
          <textarea
            name="invoiceFooter"
            defaultValue={s.invoiceFooter}
            rows={2}
            maxLength={400}
            className="input mt-1"
          />
        </label>
        <button disabled={save.isPending} className="btn-primary sm:col-span-2">
          {save.isPending ? '…' : 'Enregistrer'}
        </button>
      </form>
      <Feedback msg={msg} />
    </Card>
  )
}

/* ---------- Équipe ---------- */
interface Admin {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
}

function TeamSection() {
  const qc = useQueryClient()
  const me = useAuthStore((s) => s.user)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'team'],
    queryFn: async () => (await apiClient.get<{ data: Admin[] }>('/admin/team')).data.data,
  })
  const grant = useMutation({
    mutationFn: (email: string) => apiClient.post('/admin/team', { email }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'team'] })
      setMsg({ ok: true, text: 'Administrateur ajouté.' })
    },
    onError: (e) => setMsg({ ok: false, text: e instanceof Error ? e.message : 'Erreur' }),
  })
  const revoke = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/team/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'team'] }),
    onError: (e) => setMsg({ ok: false, text: e instanceof Error ? e.message : 'Erreur' }),
  })

  return (
    <Card title="Équipe (administrateurs)">
      {isLoading ? (
        <Loader />
      ) : (
        <ul className="divide-y divide-white/10 text-sm">
          {data?.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2">
              <div>
                <span className="font-medium">
                  {a.firstName} {a.lastName}
                </span>
                <span className="ml-2 text-xs text-muted">{a.email}</span>
              </div>
              {a.id === me?.id ? (
                <span className="text-xs text-muted">vous</span>
              ) : (
                <button
                  onClick={() => revoke.mutate(a.id)}
                  className="text-xs text-muted hover:text-danger"
                >
                  Retirer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          grant.mutate(String(f.get('email')))
          e.currentTarget.reset()
        }}
        className="mt-4 flex gap-2"
      >
        <input
          name="email"
          type="email"
          required
          placeholder="email d'un compte existant"
          className="input"
        />
        <button disabled={grant.isPending} className="btn-secondary shrink-0">
          Nommer admin
        </button>
      </form>
      <p className="mt-2 text-xs text-muted">
        Le compte doit déjà exister (inscription via le site).
      </p>
      <Feedback msg={msg} />
    </Card>
  )
}
