import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { sendEmail, emailTemplates } from '@/lib/email'
import { env } from '@/lib/env'
import { handle, ok } from '@/lib/api-response'

export const POST = handle(async (request: NextRequest) => {
  const { email } = await request.json()
  await connectDB()

  const user = await User.findOne({ email })
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    user.set('resetToken', token)
    user.set('resetTokenExpiry', new Date(Date.now() + 3_600_000))
    await user.save()

    const link = `${env.appUrl}/reset-password?token=${token}`
    const tpl = emailTemplates.passwordReset(link)
    await sendEmail({ to: email, subject: tpl.subject, html: tpl.html }).catch(() => null)
  }

  // Always return 200 to avoid account enumeration.
  return ok({ message: 'Email envoyé avec instructions' })
})
