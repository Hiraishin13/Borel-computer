import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { getStripe } from '@/lib/stripe'
import { env } from '@/lib/env'

// Stripe needs the raw body — disable Next's parsing.
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(payload, signature!, env.stripeWebhookSecret)
  } catch (err) {
    console.error('[stripe] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await connectDB()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      await Order.updateOne(
        { stripePaymentIntentId: intent.id },
        { paymentStatus: 'completed', status: 'processing' },
      )
      break
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      await Order.updateOne({ stripePaymentIntentId: intent.id }, { paymentStatus: 'failed' })
      break
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      if (charge.payment_intent) {
        await Order.updateOne(
          { stripePaymentIntentId: charge.payment_intent },
          { paymentStatus: 'refunded', status: 'cancelled' },
        )
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
