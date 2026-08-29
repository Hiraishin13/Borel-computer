import Stripe from 'stripe'
import { env } from './env'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  }
  return stripeClient
}
