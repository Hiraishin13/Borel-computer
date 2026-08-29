/**
 * Centralised, validated access to environment variables.
 * Server-only values throw at first use if missing.
 */
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  get mongodbUri() {
    return required('MONGODB_URI')
  },
  get jwtSecret() {
    return required('JWT_SECRET')
  },
  get nextAuthSecret() {
    return required('NEXTAUTH_SECRET')
  },
  get stripeSecretKey() {
    return required('STRIPE_SECRET_KEY')
  },
  get stripeWebhookSecret() {
    return required('STRIPE_WEBHOOK_SECRET')
  },
  get resendApiKey() {
    return required('RESEND_API_KEY')
  },
  emailFrom: process.env.EMAIL_FROM ?? 'Borel Computer <noreply@borelcomputer.com>',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  isProd: process.env.NODE_ENV === 'production',
}
