'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="container-page max-w-xl py-16">
      <h1 className="text-3xl font-bold">Contact</h1>
      {sent ? (
        <p className="mt-6 text-success">Message envoyé. Nous vous répondons sous 24h ouvrées.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
          className="mt-8 space-y-4"
        >
          <input required placeholder="Nom" className="input" />
          <input required type="email" placeholder="Email" className="input" />
          <textarea required rows={5} placeholder="Votre message" className="input" />
          <button type="submit" className="btn-primary">
            Envoyer
          </button>
        </form>
      )}
    </div>
  )
}
