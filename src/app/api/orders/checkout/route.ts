import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { Order } from '@/models/Order'
import { Promo } from '@/models/Promo'
import { requireAuth } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'
import { sendEmail, emailTemplates } from '@/lib/email'
import {
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
  EXPRESS_SHIPPING_SURCHARGE,
} from '@/lib/constants'
import { handle, ok, fail } from '@/lib/api-response'

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
        variant: z.string().optional(),
      }),
    )
    .min(1),
  shippingAddress: z.record(z.string()),
  billingAddress: z.record(z.string()).optional(),
  shippingMethod: z.enum(['standard', 'express']),
  paymentMethod: z.literal('cash').default('cash'),
  couponCode: z.string().optional(),
})

export const POST = handle(async (request: NextRequest) => {
  const auth = requireAuth(request)
  await connectDB()
  const body = schema.parse(await request.json())

  // Reprice server-side from the DB — never trust client prices.
  const products = await Product.find({
    _id: { $in: body.items.map((i) => i.productId) },
  }).lean()

  const items = body.items.map((line) => {
    const product = products.find((p) => String(p._id) === line.productId)
    if (!product) throw new Error(`Produit introuvable: ${line.productId}`)
    if (product.stock < line.quantity) {
      throw new Error(`Stock insuffisant pour ${product.name}`)
    }
    return {
      productId: product._id,
      sku: product.sku,
      name: product.name,
      price: product.discountPrice ?? product.price,
      quantity: line.quantity,
      variant: line.variant,
      image: product.thumbnail,
    }
  })

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  let discount = 0
  if (body.couponCode) {
    const promo = await Promo.findOne({ code: body.couponCode.toUpperCase(), active: true })
    const now = new Date()
    if (
      promo &&
      promo.validFrom <= now &&
      promo.validUntil >= now &&
      subtotal >= promo.minPurchase &&
      (promo.maxUses === 0 || promo.usedCount < promo.maxUses)
    ) {
      discount =
        promo.type === 'percentage' ? (subtotal * promo.value) / 100 : Math.min(promo.value, subtotal)
      await Promo.updateOne({ _id: promo._id }, { $inc: { usedCount: 1 } })
    } else {
      return fail('VALIDATION_ERROR', 'Code promo invalide', 400)
    }
  }

  const taxable = subtotal - discount
  const tax = +(taxable * TAX_RATE).toFixed(2)
  const baseShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
  const shipping = baseShipping + (body.shippingMethod === 'express' ? EXPRESS_SHIPPING_SURCHARGE : 0)
  const total = +(taxable + tax + shipping).toFixed(2)

  // Paiement en espèces : la commande est enregistrée "en attente", le règlement
  // se fait à la remise des articles. Aucun prestataire de paiement en ligne.
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    userId: auth.userId,
    status: 'pending',
    items,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    shippingAddress: body.shippingAddress,
    billingAddress: body.billingAddress ?? body.shippingAddress,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
  })

  // Decrement stock.
  await Promise.all(
    items.map((i) => Product.updateOne({ _id: i.productId }, { $inc: { stock: -i.quantity } })),
  )

  const tpl = emailTemplates.orderConfirmation(order.orderNumber, total)
  await sendEmail({ to: auth.email, subject: tpl.subject, html: tpl.html }).catch(() => null)

  return ok(
    {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal,
      tax,
      shipping,
      discount,
      total,
    },
    201,
  )
})
