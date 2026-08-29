import { Resend } from 'resend'
import { env } from './env'

let resend: Resend | null = null

function client() {
  if (!resend) resend = new Resend(env.resendApiKey)
  return resend
}

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  attachments?: { filename: string; content: string }[]
}) {
  return client().emails.send({
    from: env.emailFrom,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: opts.attachments,
  })
}

export const emailTemplates = {
  orderConfirmation(orderNumber: string, total: number) {
    return {
      subject: `Confirmation de commande ${orderNumber}`,
      html: `<h1>Merci pour votre commande</h1><p>Commande <strong>${orderNumber}</strong> confirmée.</p><p>Total : $${total.toFixed(2)}</p>`,
    }
  },
  passwordReset(link: string) {
    return {
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Cliquez pour réinitialiser votre mot de passe :</p><p><a href="${link}">${link}</a></p><p>Ce lien expire dans 1 heure.</p>`,
    }
  },
}
