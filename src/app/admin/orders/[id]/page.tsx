'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { downloadInvoice, invoiceFromOrder } from '@/lib/invoice'
import { useSettings } from '@/hooks/useSettings'
import type { Order } from '@/types'

interface OrderDetail {
  order: Order
  customer: { id: string; firstName: string; lastName: string; email: string; phone: string | null } | null
  invoiceSentAt: string | null
}

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient()
  const settings = useSettings()
  const [msg, setMsg] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'order', params.id],
    queryFn: async () => (await apiClient.get<OrderDetail>(`/admin/orders/${params.id}`)).data,
  })

  const patch = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiClient.patch(`/admin/orders/${params.id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'order', params.id] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })

  const sendInvoice = useMutation({
    mutationFn: () => apiClient.post(`/admin/orders/${params.id}/invoice`),
    onSuccess: (res) => {
      setMsg(`Facture envoyée à ${(res.data as { to: string }).to}`)
      qc.invalidateQueries({ queryKey: ['admin', 'order', params.id] })
    },
    onError: (e) => setMsg(e instanceof Error ? e.message : 'Échec de l’envoi'),
  })

  if (isLoading || !data) return <p className="text-muted">Chargement…</p>

  const { order: o, customer, invoiceSentAt } = data
  const addr = o.shippingAddress as unknown as Record<string, string>

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/orders" className="text-sm text-muted hover:text-light">
          ← Commandes
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{o.orderNumber}</h1>
        <p className="text-sm text-muted">
          Passée le {formatDate(o.createdAt)} · paiement{' '}
          {o.paymentMethod === 'cash' ? 'espèces' : 'carte'} ({o.paymentStatus})
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-sm font-semibold">Articles</h2>
            <table className="mt-4 w-full text-sm">
              <tbody className="divide-y divide-white/10">
                {o.items.map((it) => (
                  <tr key={it.sku + (it.variant ?? '')}>
                    <td className="py-2">
                      {it.name}
                      {it.variant ? <span className="text-xs text-muted"> · {it.variant}</span> : null}
                    </td>
                    <td className="py-2 text-right text-muted">×{it.quantity}</td>
                    <td className="py-2 text-right">{formatPrice(it.price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 space-y-1 border-t border-white/10 pt-3 text-sm">
              <Row label="Sous-total" value={formatPrice(o.subtotal)} />
              {o.discount > 0 && <Row label="Remise" value={`-${formatPrice(o.discount)}`} />}
              <Row label="TVA" value={formatPrice(o.tax)} />
              <Row label="Livraison" value={o.shipping === 0 ? 'Offerte' : formatPrice(o.shipping)} />
              <Row label="Total" value={formatPrice(o.total)} strong />
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold">Livraison</h2>
            <p className="mt-3 text-sm text-muted">
              {addr?.firstName} {addr?.lastName}
              <br />
              {addr?.street}
              <br />
              {addr?.postalCode} {addr?.city}, {addr?.country}
              {addr?.phone ? (
                <>
                  <br />
                  {addr.phone}
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold">Statut</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => patch.mutate({ status: s })}
                  disabled={patch.isPending}
                  className={
                    o.status === s
                      ? 'rounded-full bg-accent px-3 py-1 text-xs text-light'
                      : 'rounded-full border border-white/15 px-3 py-1 text-xs text-muted hover:text-light'
                  }
                >
                  {ORDER_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={o.paymentStatus === 'completed'}
                onChange={(e) =>
                  patch.mutate({ paymentStatus: e.target.checked ? 'completed' : 'pending' })
                }
              />
              Paiement encaissé
            </label>
          </div>

          {customer && (
            <div className="card p-5 text-sm">
              <h2 className="text-sm font-semibold">Client</h2>
              <Link
                href={`/admin/customers/${customer.id}`}
                className="mt-2 block font-medium hover:text-accent"
              >
                {customer.firstName} {customer.lastName}
              </Link>
              <p className="text-muted">{customer.email}</p>
              {customer.phone && <p className="text-muted">{customer.phone}</p>}
            </div>
          )}

          <div className="card space-y-2 p-5">
            <h2 className="text-sm font-semibold">Facture</h2>
            <button
              onClick={() =>
                downloadInvoice(invoiceFromOrder(o, customer?.email ?? ''), settings)
              }
              className="btn-secondary w-full"
            >
              Télécharger le PDF
            </button>
            <button
              onClick={() => sendInvoice.mutate()}
              disabled={sendInvoice.isPending || !customer?.email}
              className="btn-primary w-full"
            >
              {sendInvoice.isPending ? 'Envoi…' : 'Envoyer au client par email'}
            </button>
            {invoiceSentAt && (
              <p className="text-xs text-success">Envoyée le {formatDate(invoiceSentAt)}</p>
            )}
            {msg && <p className="text-xs text-muted">{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? 'font-bold text-light' : 'text-muted'}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
