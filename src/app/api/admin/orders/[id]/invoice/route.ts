import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { User } from '@/models/User'
import { requireAdmin } from '@/lib/auth'
import { serializeOrder } from '@/lib/serializers'
import { invoiceFromOrder, invoicePdfBase64 } from '@/lib/invoice'
import { sendEmail } from '@/lib/email'
import { getSettings } from '@/lib/settings'
import { handle, ok, fail } from '@/lib/api-response'

export const runtime = 'nodejs'

/** Génère la facture PDF de la commande et l'envoie par email au client. */
export const POST = handle(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    requireAdmin(request)
    await connectDB()

    const doc = await Order.findById(params.id).lean()
    if (!doc) return fail('NOT_FOUND', 'Commande non trouvée', 404)

    const [user, cfg] = await Promise.all([User.findById(doc.userId).lean(), getSettings()])
    if (!user?.email) return fail('VALIDATION_ERROR', 'Client sans email', 400)

    const data = invoiceFromOrder(serializeOrder(doc), user.email)
    const pdf = await invoicePdfBase64(data, cfg)
    const shopName = cfg.sellerName || cfg.shopName

    const res = await sendEmail({
      to: user.email,
      subject: `Votre facture ${data.orderNumber} — ${shopName}`,
      html: `<p>Bonjour ${data.customer.firstName},</p>
        <p>Veuillez trouver ci-joint la facture de votre commande <strong>${data.orderNumber}</strong>
        d'un montant de <strong>$${data.totals.total.toFixed(2)}</strong>.</p>
        <p>Paiement en espèces à la livraison / au retrait.</p>
        <p>— L'équipe ${shopName}</p>`,
      attachments: [{ filename: `facture-${data.orderNumber}.pdf`, content: pdf }],
    })

    if (res.error) {
      return fail('EMAIL_ERROR', `Envoi impossible : ${res.error.message}`, 502)
    }

    await Order.findByIdAndUpdate(params.id, { invoiceSentAt: new Date() })

    return ok({ sent: true, to: user.email, at: new Date().toISOString() })
  },
)
